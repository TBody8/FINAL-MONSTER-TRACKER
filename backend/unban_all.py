import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\backend\.env")

async def unban_all_users():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        db = client["monstertracker"]
        
        # Unset the ban_until field for any user that has it
        result = await db.users.update_many(
            {"ban_until": {"$exists": True}},
            {"$unset": {"ban_until": ""}}
        )
        print(f"SUCCESS: Lifted the ban from {result.modified_count} users affected today.")
        
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(unban_all_users())
