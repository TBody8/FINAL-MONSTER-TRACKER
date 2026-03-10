from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from pydantic import BaseModel, StrictStr, Field
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from jose import jwt
from dotenv import load_dotenv
from pathlib import Path
import os
from datetime import datetime, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

SECRET_KEY = os.environ.get('JWT_SECRET', 'secret')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

router = APIRouter(prefix="/api/auth")

from database import db
users_collection = db["users"]

class UserIn(BaseModel):
    username: StrictStr = Field(..., max_length=50)
    password: StrictStr = Field(..., max_length=100)
    mt_uuid_ban: bool = False

class UserOut(BaseModel):
    username: StrictStr = Field(..., max_length=50)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class MessageResponse(BaseModel):
    message: str
    user: UserOut

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Hardcoded Developer Network Bypass
PROTECTED_IPS = ["192.168.1.51", "127.0.0.1", "localhost"]

@router.post('/register', response_model=MessageResponse)
async def register(request: Request, response: Response, user: UserIn):
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    anti_cheat_mode = os.environ.get("ANTI_CHEAT_MODE", "live").lower()
    is_protected_ip = client_ip in PROTECTED_IPS
    is_developer = (user.username == "diego")
    
    # 1. Anti-Cheat: Check if IP is permanently banned
    banned_ip_doc = await db["banned_ips"].find_one({"ip": client_ip})
    if banned_ip_doc and not is_developer:
        if anti_cheat_mode == "live" and not is_protected_ip:
            raise HTTPException(status_code=403, detail="Permaban por tonto")
        elif is_protected_ip:
             print("DEBUG: Protected IP bypassed actual DB permaban logic but will trigger UI")
             raise HTTPException(status_code=403, detail="Permaban por tonto")
            
    # 2. Anti-Cheat: Check if Frontend detected a local ban evasion
    if user.mt_uuid_ban and not is_developer:
        if anti_cheat_mode == "live":
            # Save IP to permanent blacklist ONLY if not protected
            if not is_protected_ip:
                await db["banned_ips"].insert_one({
                    "ip": client_ip,
                    "reason": "Ban Evasion (LocalStorage Flag)",
                    "date": datetime.utcnow().isoformat()
                })
            print(f"DEBUG: Triggered Permaban on Frontend evasion. Protected={is_protected_ip}")
            raise HTTPException(status_code=403, detail="Permaban por tonto")
            
    existing = await users_collection.find_one({"username": user.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = get_password_hash(user.password)
    
    # Save IP linked to user for tracing
    await users_collection.insert_one({
        "username": user.username, 
        "password": hashed,
        "registered_ip": client_ip
    })
    token = create_access_token({"sub": user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    # Secure HttpOnly Cookie Injection
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False, # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return {"message": "Successfully registered", "user": {"username": user.username}}

# In-memory IP-based rate limiter (for Brute-Force protection)
# Format: { "ip_address": [datetime1, datetime2, ...] }
failed_login_attempts = {}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_WINDOW_MINUTES = 5

@router.post('/login', response_model=MessageResponse)
async def login(request: Request, response: Response, user: UserIn):
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    anti_cheat_mode = os.environ.get("ANTI_CHEAT_MODE", "live").lower()
    is_protected_ip = client_ip in PROTECTED_IPS
    is_developer = (user.username == "diego")

    # --- RATE LIMITING CHECK ---
    now = datetime.utcnow()
    # Clean up old timestamps
    if client_ip in failed_login_attempts:
        failed_login_attempts[client_ip] = [
            t for t in failed_login_attempts[client_ip] 
            if now - t < timedelta(minutes=LOCKOUT_WINDOW_MINUTES)
        ]
        if len(failed_login_attempts[client_ip]) >= MAX_LOGIN_ATTEMPTS and not is_developer:
            raise HTTPException(
                status_code=429, 
                detail="Too many failed login attempts. Please try again later."
            )

    # Verify credentials BEFORE applying severe punishments to avoid spoofed dictionary attacks
    db_user = await users_collection.find_one({"username": user.username})
    if not db_user or not verify_password(user.password, db_user['password']):
        # Register failed attempt
        if client_ip not in failed_login_attempts:
            failed_login_attempts[client_ip] = []
        failed_login_attempts[client_ip].append(now)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Helper function to completely erase an evader's existence
    async def pulverize_account():
        if not is_developer:
            await users_collection.delete_one({"username": user.username})
            await db["consumption"].delete_many({"username": user.username})
            print(f"[Anti-Cheat] ☠️ Cuenta PULVERIZADA por Permaban: {user.username} (IP: {client_ip})")

    # 1. Anti-Cheat: Check if IP is permanently banned
    banned_ip_doc = await db["banned_ips"].find_one({"ip": client_ip})
    if banned_ip_doc and not is_developer:
        if anti_cheat_mode == "live" and not is_protected_ip:
            await pulverize_account()
            raise HTTPException(status_code=403, detail="Permaban por tonto")
        elif is_protected_ip:
             print("DEBUG: Protected IP bypassed actual DB permaban logic but will trigger UI")
             raise HTTPException(status_code=403, detail="Permaban por tonto")

    # 2. Anti-Cheat: Check if Frontend detected a local ban evasion during login
    if user.mt_uuid_ban and not is_developer:
        if anti_cheat_mode == "live":
            if not is_protected_ip:
                # Ensure we don't insert duplicate IP bans
                existing_ban = await db["banned_ips"].find_one({"ip": client_ip})
                if not existing_ban:
                    await db["banned_ips"].insert_one({
                        "ip": client_ip,
                        "reason": "Ban Evasion (LocalStorage Flag on Login)",
                        "date": datetime.utcnow().isoformat()
                    })
                await pulverize_account()
            raise HTTPException(status_code=403, detail="Permaban por tonto")
        
    # Check if the individual user has an active temporary ban that hasn't expired yet
    ban_until = db_user.get("ban_until")
    if ban_until:
        if isinstance(ban_until, str):
            ban_until = datetime.fromisoformat(ban_until)
        # Check against developer bypass so Diego can log in to his own account without infinite lockouts
        if datetime.utcnow() < ban_until and not is_developer:
             raise HTTPException(status_code=403, detail={"message": "Tu cuenta está temporal o permanentemente suspendida.", "ban_until": ban_until.isoformat()})

    # Reset failed attempts upon successful login
    if client_ip in failed_login_attempts:
        del failed_login_attempts[client_ip]

    token = create_access_token({"sub": user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    # Secure HttpOnly Cookie Injection
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False, # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return {"message": "Successfully logged in", "user": {"username": user.username}}

@router.post('/logout')
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax"
    )
    return {"message": "Successfully logged out"}

from dependencies import get_current_username

@router.get('/me', response_model=UserOut)
async def get_current_user_info(username: str = Depends(get_current_username)):
    return {"username": username}
