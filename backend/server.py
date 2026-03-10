from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, StrictStr
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta
from auth import router as auth_router
from dependencies import get_current_username
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import client, db

print("MONGO_URI:", os.environ.get("MONGO_URI"))
app = FastAPI()

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:;"
    return response

api_router = APIRouter(prefix="/api")

# Define MongoDB collections
users_collection = db["users"]
consumption_collection = db["consumption"]
goals_collection = db["goals"]
settings_collection = db["settings"]

# Leaderboard Cache
leaderboard_cache = {
    "data": None,
    "last_updated": None
}

PROTECTED_IPS = ["192.168.1.51", "127.0.0.1", "localhost", "::1"]

# Define Models
class DrinkItem(BaseModel):
    id: StrictStr = Field(..., max_length=50)
    price: float = Field(..., ge=0, le=6.0)
    timestamp: Optional[StrictStr] = Field(None, max_length=50)

class ConsumptionData(BaseModel):
    date: StrictStr = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")  # Formato YYYY-MM-DD
    drinks: List[DrinkItem]
    totalCaffeine: float = Field(..., ge=0)
    totalCost: float = Field(..., ge=0)
    username: StrictStr = Field(..., max_length=50)
    spam_trigger: Optional[bool] = False

class Goals(BaseModel):
    enableDailyLimit: bool
    dailyLimit: float = Field(..., ge=0)
    limitType: StrictStr = Field(..., max_length=20)
    enableNotifications: bool

class Settings(BaseModel):
    theme: StrictStr = Field(..., max_length=20)
    currency: StrictStr = Field(..., max_length=10)
    # PartyMeter Profile
    partyMeterSex: Optional[StrictStr] = Field(None, max_length=10)
    partyMeterWeight: Optional[StrictStr] = Field(None, max_length=10)
    darkModeContrast: StrictStr = Field(..., max_length=20)
    animationIntensity: StrictStr = Field(..., max_length=20)
    reducedMotion: bool
    autoRefresh: bool
    showAdvancedStats: bool

# Routes for Monster Tracker
@api_router.get("/consumption", response_model=List[ConsumptionData])
async def get_consumption_data(username: str = Depends(get_current_username)):
    try:
        print(f"[GET /consumption] Petición recibida para usuario: {username}")
        data = await consumption_collection.find({"username": username}).sort("date", -1).to_list(1000)
        print(f"[GET /consumption] Datos encontrados: {len(data)} registros para {username}")
        return [ConsumptionData(**item) for item in data]
    except Exception as e:
        logging.error(f"Error fetching consumption data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching data")

from fastapi import Request

@api_router.post("/consumption", response_model=ConsumptionData)
async def add_consumption(data: ConsumptionData, request: Request, username: str = Depends(get_current_username)):
    global leaderboard_cache
    
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    is_protected_ip = client_ip in PROTECTED_IPS
    is_developer = (username == "diego")
    
    # Check block status
    db_user = await users_collection.find_one({"username": username})
    if db_user and db_user.get("ban_until"):
        ban_until = db_user.get("ban_until")
        if isinstance(ban_until, str):
            ban_until = datetime.fromisoformat(ban_until)
        if datetime.utcnow() < ban_until and not is_developer:
            raise HTTPException(status_code=403, detail={"message": "Tu cuenta está temporal o permanentemente suspendida.", "ban_until": ban_until.isoformat()})

    # Spam Detection (Fast Follow-up Penalty from Frontend)
    is_spam = getattr(data, 'spam_trigger', False)

    if is_spam:
        anti_cheat_mode = os.environ.get("ANTI_CHEAT_MODE", "live").lower()
        ban_time = datetime.utcnow() + timedelta(hours=12)
        
        # Erase the fraudulent consumption day entirely from MongoDB
        try:
            await consumption_collection.delete_one({"date": data.date, "username": username})
            leaderboard_cache["data"] = None
            leaderboard_cache["last_updated"] = None
            print(f"[Anti-Cheat] Borrado día fraudulento {data.date} para usuario {username}")
        except Exception as e:
            logging.error(f"Error erasing fraudulent consumption: {str(e)}")

        if anti_cheat_mode == "live" and not is_protected_ip and not is_developer:
            await users_collection.update_one(
                {"username": username},
                {"$set": {"ban_until": ban_time.isoformat()}}
            )
        
        raise HTTPException(status_code=429, detail={"message": "too_many_requests_ban", "ban_until": ban_time.isoformat()})

    try:
        # LOG: Mostrar los datos recibidos y el usuario
        print("[POST /consumption] Data recibida:", data.dict())
        print("[POST /consumption] Username extraído:", username)
        # Always save with the correct username
        data_dict = data.dict()
        data_dict["username"] = username
        print("[POST /consumption] Data a guardar:", data_dict)
        existing = await consumption_collection.find_one({"date": data.date, "username": username})
        if existing:
            print("[POST /consumption] Actualizando consumo existente para este usuario y fecha")
            await consumption_collection.update_one(
                {"date": data.date, "username": username},
                {"$set": data_dict}
            )
        else:
            print("[POST /consumption] Insertando nuevo consumo para este usuario y fecha")
            await consumption_collection.insert_one(data_dict)
            
        # Invalidate Cache
        leaderboard_cache["data"] = None
        leaderboard_cache["last_updated"] = None
        
        return ConsumptionData(**data_dict)
    except Exception as e:
        logging.error(f"Error saving consumption data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error saving data")

@api_router.delete("/consumption/{date}")
async def delete_consumption(date: str, username: str = Depends(get_current_username)):
    global leaderboard_cache
    try:
        print(f"[DELETE /consumption/{date}] Petición recibida para usuario: {username}")
        result = await consumption_collection.delete_one({"date": date, "username": username})
        if result.deleted_count == 0:
            print(f"[DELETE /consumption/{date}] No se encontró registro para borrar")
        else:
            print(f"[DELETE /consumption/{date}] Registro borrado exitosamente")
            # Invalidate Cache only if something was actually deleted
            leaderboard_cache["data"] = None
            leaderboard_cache["last_updated"] = None
            
        return {"status": "success", "message": "Consumption deleted"}
    except Exception as e:
        logging.error(f"Error deleting consumption data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting data")

@api_router.get("/goals", response_model=Goals)
async def get_goals(username: str = Depends(get_current_username)):
    try:
        goals = await goals_collection.find_one({"username": username})
        if not goals:
            # Return default goals if none exist
            default_goals = Goals(
                enableDailyLimit=True,
                dailyLimit=400,
                limitType="daily",
                enableNotifications=True
            )
            goals_dict = default_goals.dict()
            goals_dict["username"] = username
            await goals_collection.insert_one(goals_dict)
            return default_goals
        return Goals(**goals)
    except Exception as e:
        logging.error(f"Error fetching goals: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching goals")

@api_router.put("/goals", response_model=Goals)
async def update_goals(goals: Goals, username: str = Depends(get_current_username)):
    try:
        goals_dict = goals.dict()
        goals_dict["username"] = username
        await goals_collection.update_one(
            {"username": username},
            {"$set": goals_dict},
            upsert=True
        )
        return goals
    except Exception as e:
        logging.error(f"Error updating goals: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating goals")

@api_router.get("/settings", response_model=Settings)
async def get_settings(username: str = Depends(get_current_username)):
    try:
        settings = await settings_collection.find_one({"username": username})
        if not settings:
            # Return default settings if none exist
            default_settings = Settings(
                darkModeContrast="normal",
                animationIntensity="normal",
                reducedMotion=False,
                autoRefresh=True,
                showAdvancedStats=True
            )
            settings_dict = default_settings.dict()
            settings_dict["username"] = username
            await settings_collection.insert_one(settings_dict)
            return default_settings
        return Settings(**settings)
    except Exception as e:
        logging.error(f"Error fetching settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching settings")

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings: Settings, username: str = Depends(get_current_username)):
    try:
        settings_dict = settings.dict()
        settings_dict["username"] = username
        await settings_collection.update_one(
            {"username": username},
            {"$set": settings_dict},
            upsert=True
        )
        return settings
    except Exception as e:
        logging.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating settings")

# RUTA DE LEADERBOARD RANKEDS
@api_router.get("/leaderboard")
async def get_leaderboard():
    global leaderboard_cache
    
    # Check if cache has data
    today_str = datetime.now().strftime("%Y-%m-%d")
    if leaderboard_cache["data"] is not None:
        return leaderboard_cache["data"]
        
    try:
        now_str = datetime.utcnow().isoformat()
        banned_users_cursor = await users_collection.find({"ban_until": {"$gt": now_str}}).to_list(1000)
        excluded_usernames = ["diego"] + [u.get("username") for u in banned_users_cursor if u.get("username")]

        pipeline = [
            {"$match": {"username": {"$nin": excluded_usernames}}},
            {"$group": {
                "_id": "$username",
                "totalCaffeine": {"$sum": {"$toDouble": {"$ifNull": ["$totalCaffeine", 0]}}},
                "allDrinksArrays": {"$push": "$drinks"}
            }},
            {"$unwind": "$allDrinksArrays"},
            {"$unwind": "$allDrinksArrays"},
            {"$group": {
                "_id": {
                    "username": "$_id",
                    "drinkId": "$allDrinksArrays.id"
                },
                "drinkCount": {"$sum": 1},
                "totalCaffeine": {"$first": "$totalCaffeine"},
                "spentOnDrink": {"$sum": {"$toDouble": {"$ifNull": ["$allDrinksArrays.price", {"$ifNull": ["$allDrinksArrays.defaultPrice", 0]}]}}}
            }},
            {"$sort": {"drinkCount": -1}},
            {"$group": {
                "_id": "$_id.username",
                "totalDrinksCount": {"$sum": "$drinkCount"},
                "totalSpent": {"$sum": "$spentOnDrink"},
                "favoriteDrinkId": {"$first": "$_id.drinkId"},
                "totalCaffeine": {"$first": "$totalCaffeine"}
            }},
            {"$project": {
                "username": "$_id",
                "totalDrinksCount": 1,
                "totalSpent": 1,
                "favoriteDrinkId": 1,
                "totalCaffeine": 1,
                "_id": 0
            }},
            {"$sort": {
                "totalDrinksCount": -1
            }}
        ]
        
        cursor = consumption_collection.aggregate(pipeline)
        leaderboard_data = await cursor.to_list(length=100)
        
        # Calculate streaks
        dates_pipeline = [
            {"$match": {"username": {"$nin": excluded_usernames}}},
            {"$group": {
                "_id": "$username",
                "dates": {"$push": "$date"}
            }}
        ]
        dates_cursor = consumption_collection.aggregate(dates_pipeline)
        dates_data = await dates_cursor.to_list(length=100)
        
        user_streaks = {}
        user_streaks = {}
        for user_dates in dates_data:
            username = user_dates["_id"]
            try:
                dates = sorted([datetime.strptime(d, "%Y-%m-%d") for d in set(user_dates.get("dates", []))])
            except:
                dates = []
                
            max_streak = 0
            current_streak = 0
            for i in range(len(dates)):
                if i == 0:
                    current_streak = 1
                else:
                    diff = (dates[i] - dates[i-1]).days
                    if diff == 1:
                        current_streak += 1
                    elif diff > 1:
                        current_streak = 1
                if current_streak > max_streak:
                    max_streak = current_streak
            
            active_current_streak = 0
            if dates:
                today = datetime.now().date()
                days_since_last = (today - dates[-1].date()).days
                if days_since_last <= 1:
                    active_current_streak = current_streak
                    
            user_streaks[username] = {"max": max_streak, "current": active_current_streak}
            
        # Merge maxStreak and currentStreak into leaderboard data and assign random tiebreaker
        for user in leaderboard_data:
            streaks = user_streaks.get(user.get("username"), {"max": 0, "current": 0})
            user["maxStreak"] = streaks.get("max", 0)
            user["currentStreak"] = streaks.get("current", 0)
            user["_random_tiebreaker"] = random.random()
            
        # Final Python Sort: totalDrinks(desc), maxStreak(desc), totalSpent(desc), random(desc)
        leaderboard_data.sort(key=lambda x: (
            x.get("totalDrinksCount", 0),
            x.get("maxStreak", 0),
            x.get("totalSpent", 0),
            x.get("_random_tiebreaker", 0)
        ), reverse=True)
        
        # Cleanup
        for user in leaderboard_data:
            user.pop("_random_tiebreaker", None)
        
        # Update Cache
        leaderboard_cache["data"] = leaderboard_data
        leaderboard_cache["last_updated"] = today_str
        
        return leaderboard_data
        
    except Exception as e:
        logging.error(f"Error generating leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating leaderboard")

# Include the router
app.include_router(api_router)
app.include_router(auth_router)

# CORS middleware
frontend_url = os.environ.get("FRONTEND_URL")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

from fastapi.responses import FileResponse

# Serve static files and SPA fallback
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Attempt to find the file in the React build folder
    build_dir = ROOT_DIR.parent / "build"
    file_path = build_dir / full_path

    # If it's a direct request to a file (like CSS, JS, images)
    if file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for React Router
    index_path = build_dir / "index.html"
    if index_path.is_file():
        return FileResponse(index_path)
        
    raise HTTPException(status_code=404, detail="File not found")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()