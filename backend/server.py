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
from datetime import datetime, date
from auth import router as auth_router
from dependencies import get_current_username

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

# Montar archivos estáticos
static_dir = ROOT_DIR / "static"
if not static_dir.exists():
    static_dir.mkdir(parents=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()