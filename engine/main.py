import os
import requests
import json
import datetime
from config import SUPABASE_URL, SUPABASE_KEY
from fetch_google import fetch_google_trends
from fetch_twitch import fetch_twitch_trends
from fetch_youtube import fetch_youtube_trends

def save_trends(trends: list, platform: str):
    if not trends:
        return
    
    print(f"Saving {len(trends)} trends to database...")
    
    # Use REST API for Upsert
    url = f"{SUPABASE_URL}/rest/v1/trends_cache?on_conflict=platform,external_id"
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    # Prepare data for insertion
    data_to_insert = []
    
    for trend in trends:
        data_to_insert.append({
            "platform": trend['platform'],
            "external_id": trend['external_id'],
            "title": trend['title'],
            "description": trend.get('description', ''),
            "channel_title": trend['channel_title'],
            "category": trend.get('category', ''),
            "thumbnail": trend.get('thumbnail', ''),
            "url": trend.get('url', ''),
            "region": trend.get('region', 'GLOBAL'),
            "published_at": trend['published_at'],
            "metrics": trend['metrics'],
            "trend_score": trend['trend_score'],
            "last_updated": trend['last_updated']
        })
        
    try:
        response = requests.post(url, json=data_to_insert, headers=headers)
        if response.status_code in [200, 201]:
            print("Success.")
        else:
            print(f"Database Error: {response.text}")
    except Exception as e:
        print(f"Request Error: {e}")

def auto_import_viral_trends(limit=10):
    """Automatically imports top trends into repository for the Inbox."""
    print("Auto-importing viral trends to Inbox...")
    
    # 1. Fetch Top Trends from Cache
    try:
        # Fetching top scoring items across all platforms
        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/trends_cache?select=*&order=trend_score.desc&limit={limit}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
        )
        if response.status_code != 200:
            print(f"Error fetching top trends: {response.text}")
            return

        top_trends = response.json()
        
        imported_count = 0
        for trend in top_trends:
            # 2. Check if already in Repository (by trend_id)
            check = requests.get(
                f"{SUPABASE_URL}/rest/v1/repository?select=id&trend_id=eq.{trend['id']}",
                headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
            )
            
            # If not found (empty list), insert it
            if check.status_code == 200 and len(check.json()) == 0:
                # 3. Insert into Repository
                payload = {
                    "trend_id": trend['id'],
                    "status": "new", # 'new' = Inbox
                    "notes": "Auto-imported Viral Trend",
                    "saved_at": datetime.datetime.now().isoformat()
                }
                insert = requests.post(
                    f"{SUPABASE_URL}/rest/v1/repository",
                    json=payload,
                    headers={
                        "apikey": SUPABASE_KEY,
                        "Authorization": f"Bearer {SUPABASE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    }
                )
                if insert.status_code in [200, 201]:
                    imported_count += 1
        
        print(f"Auto-imported {imported_count} viral videos to Inbox.")

    except Exception as e:
        print(f"Auto-import failed: {e}")

def main():
    print("Starting Data Engine...")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: Supabase credentials missing in .env")
        return

    # 1. Fetch YouTube
    try:
        print("\n--- YouTube ---")
        yt_data = fetch_youtube_trends(region='US')
        if yt_data:
            save_trends(yt_data, 'youtube')
    except Exception as e:
        print(f"YouTube Engine Failed: {e}")

    # 2. Fetch Google Trends
    try:
        print("\n--- Google Trends ---")
        google_data = fetch_google_trends(region='US')
        if google_data:
            save_trends(google_data, 'google_trends')
    except Exception as e:
        print(f"Google Engine Failed: {e}")

    # 3. Fetch Twitch
    try:
        print("\n--- Twitch ---")
        twitch_data = fetch_twitch_trends()
        if twitch_data:
            save_trends(twitch_data, 'twitch')
    except Exception as e:
        print(f"Twitch Engine Failed: {e}")
        
    # 4. Auto-Import
    # User requested Inbox to be a "Feed" (trends_cache) and Repository to be "Saved".
    # So we do NOT auto-move items to repository anymore.
    # try:
    #     auto_import_viral_trends()
    # except Exception as e:
    #     print(f"Auto-Import Failed: {e}")
    
    print("\nData Engine Cycle Completed.")

import time

if __name__ == "__main__":
    if os.getenv("CONTINUOUS_MODE", "false").lower() == "true":
        print("Running in CONTINUOUS MODE (Service)")
        while True:
            try:
                main()
            except Exception as e:
                print(f"Critical Engine Error: {e}")
            
            print("Sleeping for 1 hour...")
            time.sleep(3600)
    else:
        # Run once (Cron / Local)
        main()
