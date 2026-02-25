import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_conn():
    load_dotenv('backend/.env')
    variations = [
        os.getenv('MONGO_URI'),
    ]
    
    for test_uri in variations:
        print(f"\n--- Testing variation: {test_uri} ---")
        client = AsyncIOMotorClient(test_uri, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
        try:
            print("Pinging...")
            await client.admin.command('ping')
            print("Ping successful!")
            db_name = os.getenv('MONGO_DB_NAME', 'monstertracker')
            db = client[db_name]
            collections = await db.list_collection_names()
            print(f"Collections: {collections}")
            print("SUCCESS with this variation!")
            break
        except Exception as e:
            print(f"Failed: {type(e).__name__}: {e}")
        finally:
            client.close()

if __name__ == "__main__":
    asyncio.run(test_conn())
