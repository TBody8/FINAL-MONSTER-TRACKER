import os
import asyncio
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\.env")

async def test():
    client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client["monster-db"]
    docs = await db.consumption.find({}).to_list(1000)
    
    user_dates = {}
    for doc in docs:
        usr = doc.get("username", "Unknown")
        if usr not in user_dates:
            user_dates[usr] = []
        user_dates[usr].append(doc["date"])
    
    for usr, dates_str in user_dates.items():
        try:
            dates = sorted([datetime.strptime(d, "%Y-%m-%d") for d in set(dates_str)])
        except Exception as e:
            print(f"Error parsing dates for {usr}: {e}. Dates: {dates_str}")
            continue
            
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
            print(f"User {usr}: Last date {dates[-1].date()}, today {today}, diff {days_since_last}, raw current = {current_streak}")
            if days_since_last <= 1:
                active_current_streak = current_streak
        else:
            print(f"User {usr}: No valid dates")
            
        print(f"  -> Result: max={max_streak}, active={active_current_streak}\n")

asyncio.run(test())
