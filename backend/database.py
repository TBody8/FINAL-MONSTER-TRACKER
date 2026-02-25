import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

def get_database():
    mongo_url = os.getenv('MONGO_URI')
    db_name = os.getenv('MONGO_DB_NAME', 'monstertracker')
    print(f"Initializing MongoDB Client (URI: {mongo_url[:20]}..., DB: {db_name})")
    
    # Adding timeouts to prevent hangs
    client = AsyncIOMotorClient(
        mongo_url,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000
    )
    return client, client[db_name]

# Global instances
client, db = get_database()
