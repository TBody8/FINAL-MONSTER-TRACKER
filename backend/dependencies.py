from fastapi import Request, HTTPException, status
from jose import JWTError, jwt
import os

SECRET_KEY = os.environ.get('JWT_SECRET', 'secret')
ALGORITHM = 'HS256'

def get_current_username(request: Request):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials / Token expired",
    )
    
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to header just in case during transition
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except JWTError:
        raise credentials_exception
