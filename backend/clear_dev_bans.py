import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\.env")

async def clear_bans():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        db = client["monster-db"]
        
        # Clear local development IPs from the permanent blacklist
        result = await db.banned_ips.delete_many({
            "ip": {"$in": ["127.0.0.1", "localhost", "::1", "192.168.1.51"]}
        })
        print(f"Cleared {result.deleted_count} protected IPs from banned_ips collection.")
        
        # Also remove any ban_until flags from all users so they can test cleanly
        users_result = await db.users.update_many(
            {}, 
            {"$unset": {"ban_until": ""}}
        )
        print(f"Removed ban_until flags from {users_result.modified_count} users.")
        
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(clear_bans())
