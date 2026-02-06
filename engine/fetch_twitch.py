import requests
import datetime
from .config import TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET

def get_twitch_access_token():
    if not TWITCH_CLIENT_ID or not TWITCH_CLIENT_SECRET:
        print("Twitch credentials missing.")
        return None
        
    url = "https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": TWITCH_CLIENT_ID,
        "client_secret": TWITCH_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    
    try:
        response = requests.post(url, params=params)
        data = response.json()
        if "access_token" in data:
            return data["access_token"]
            return data["access_token"]
        else:
            print(f"Failed to get Twitch token. Status: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting Twitch token: {e}")
        return None

def fetch_twitch_trends(limit=100):
    print("Fetching Twitch trends...")
    token = get_twitch_access_token()
    if not token:
        return []

    trends = []
    headers = {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        # Fetch Top Streams
        response = requests.get("https://api.twitch.tv/helix/streams?first=" + str(limit), headers=headers)
        print(f"Debug: Twitch Streams Status: {response.status_code}")
        if response.status_code != 200:
             print(f"Debug: Twitch Streams Error: {response.text}")
             
        data = response.json()
        
        for stream in data.get("data", []):
            trends.append({
                "platform": "twitch",
                "external_id": stream["id"],
                "title": stream["title"],
                "description": f"Playing {stream['game_name']} - {stream['language']}",
                "channel_title": stream["user_name"],
                "category": stream["game_name"],
                "thumbnail": stream["thumbnail_url"].replace("{width}", "600").replace("{height}", "400"),
                "url": f"https://www.twitch.tv/{stream['user_name']}",
                "region": "GLOBAL", # Inferred from language effectively
                "published_at": stream["started_at"],
                "metrics": {
                    "viewers": stream["viewer_count"],
                    "language": stream["language"]
                },
                "trend_score": float(stream["viewer_count"]) / 100.0, # Simple score
                "last_updated": datetime.datetime.now().isoformat()
            })
            
    except Exception as e:
        print(f"Error fetching Twitch streams: {e}")
        
    return trends
