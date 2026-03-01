from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta
from auth import router as auth_router
from dependencies import get_current_username
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import client, db

print("MONGO_URI:", os.environ.get("MONGO_URI"))
app = FastAPI()
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

# Define Models
class DrinkItem(BaseModel):
    id: str
    price: float
    timestamp: Optional[str] = None

class ConsumptionData(BaseModel):
    date: str  # Formato YYYY-MM-DD
    drinks: List[DrinkItem]
    totalCaffeine: float
    totalCost: float
    username: str = Field(...)

class Goals(BaseModel):
    enableDailyLimit: bool
    dailyLimit: float
    limitType: str
    enableNotifications: bool

class Settings(BaseModel):
    darkModeContrast: str
    animationIntensity: str
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

@api_router.post("/consumption", response_model=ConsumptionData)
async def add_consumption(data: ConsumptionData, username: str = Depends(get_current_username)):
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
        return ConsumptionData(**data_dict)
    except Exception as e:
        logging.error(f"Error saving consumption data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error saving data")

@api_router.delete("/consumption/{date}")
async def delete_consumption(date: str, username: str = Depends(get_current_username)):
    try:
        print(f"[DELETE /consumption/{date}] Petición recibida para usuario: {username}")
        result = await consumption_collection.delete_one({"date": date, "username": username})
        if result.deleted_count == 0:
            print(f"[DELETE /consumption/{date}] No se encontró registro para borrar")
        else:
            print(f"[DELETE /consumption/{date}] Registro borrado exitosamente")
        return {"status": "success", "message": "Consumption deleted"}
    except Exception as e:
        logging.error(f"Error deleting consumption data: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting data")

@api_router.get("/goals", response_model=Goals)
async def get_goals():
    try:
        goals = await goals_collection.find_one({})
        if not goals:
            # Return default goals if none exist
            default_goals = Goals(
                enableDailyLimit=True,
                dailyLimit=400,
                limitType="daily",
                enableNotifications=True
            )
            await goals_collection.insert_one(default_goals.dict())
            return default_goals
        return Goals(**goals)
    except Exception as e:
        logging.error(f"Error fetching goals: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching goals")

@api_router.put("/goals", response_model=Goals)
async def update_goals(goals: Goals):
    try:
        await goals_collection.update_one(
            {},
            {"$set": goals.dict()},
            upsert=True
        )
        return goals
    except Exception as e:
        logging.error(f"Error updating goals: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating goals")

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    try:
        settings = await settings_collection.find_one({})
        if not settings:
            # Return default settings if none exist
            default_settings = Settings(
                darkModeContrast="normal",
                animationIntensity="normal",
                reducedMotion=False,
                autoRefresh=True,
                showAdvancedStats=True
            )
            await settings_collection.insert_one(default_settings.dict())
            return default_settings
        return Settings(**settings)
    except Exception as e:
        logging.error(f"Error fetching settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching settings")

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings: Settings):
    try:
        await settings_collection.update_one(
            {},
            {"$set": settings.dict()},
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
    
    # Check if cache is valid (updated today)
    today_str = datetime.now().strftime("%Y-%m-%d")
    if leaderboard_cache["data"] is not None and leaderboard_cache["last_updated"] == today_str:
        return leaderboard_cache["data"]
        
    try:
        pipeline = [
            {"$match": {"username": {"$ne": "diego"}}},
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
            {"$sort": {"totalDrinksCount": -1}}
        ]
        
        cursor = consumption_collection.aggregate(pipeline)
        leaderboard_data = await cursor.to_list(length=100)
        
        # Calculate streaks
        dates_pipeline = [
            {"$match": {"username": {"$ne": "diego"}}},
            {"$group": {
                "_id": "$username",
                "dates": {"$push": "$date"}
            }}
        ]
        dates_cursor = consumption_collection.aggregate(dates_pipeline)
        dates_data = await dates_cursor.to_list(length=100)
        
        user_streaks = {}
        for user_dates in dates_data:
            username = user_dates["_id"]
            try:
                dates = sorted([datetime.strptime(d, "%Y-%m-%d") for d in user_dates.get("dates", [])])
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
            user_streaks[username] = max_streak
            
        # Merge maxStreak into leaderboard data
        for user in leaderboard_data:
            user["maxStreak"] = user_streaks.get(user.get("username"), 0)
        
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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