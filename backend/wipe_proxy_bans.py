import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\backend\.env")

async def wipe_all_ip_bans():
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        db = client["monstertracker"]
        
        # WIPE ALL BANNED IPS - The Proxy was banned!
        result = await db.banned_ips.delete_many({})
        print(f"CRITICAL FIX: Wiped {result.deleted_count} IPs from banned_ips collection. Service restored.")
        
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(wipe_all_ip_bans())
