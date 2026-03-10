import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\backend\.env")

async def rename_user(old_username: str, new_username: str):
    try:
        client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
        db = client["monstertracker"]
        
        # 1. Update users collection
        user_result = await db.users.update_one(
            {"username": old_username},
            {"$set": {"username": new_username}}
        )
        print(f"Users collection: {user_result.modified_count} user(s) updated.")

        # 2. Update consumption collection (multiple documents possible)
        consumption_result = await db.consumption.update_many(
            {"username": old_username},
            {"$set": {"username": new_username}}
        )
        print(f"Consumption collection: {consumption_result.modified_count} record(s) updated.")

        # 3. Update goals collection
        goals_result = await db.goals.update_many(
            {"username": old_username},
            {"$set": {"username": new_username}}
        )
        print(f"Goals collection: {goals_result.modified_count} record(s) updated.")

        # 4. Update settings collection
        settings_result = await db.settings.update_many(
            {"username": old_username},
            {"$set": {"username": new_username}}
        )
        print(f"Settings collection: {settings_result.modified_count} record(s) updated.")

        print(f"\nSuccessfully renamed '{old_username}' to '{new_username}' across all collections!")

    except Exception as e:
        print(f"Error during rename: {e}")

asyncio.run(rename_user("Gimenezlongaresc@gmail.com", "Cherry"))
