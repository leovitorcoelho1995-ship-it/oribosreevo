
import requests
import os
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = "AIzaSyB49D_zEg2cTjXd3y_dyPHeS_3IfNtijVU" # Hardcoded from config.py
TWITCH_CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
TWITCH_CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")

def verify_youtube():
    print("--- Verifying YouTube ---")
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "snippet",
        "chart": "mostPopular",
        "regionCode": "US",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("YouTube API Key is VALID.")
            data = response.json()
            if "items" in data and len(data["items"]) > 0:
                print("Successfully fetched video data.")
            else:
                print("Fetched data but 'items' list is empty.")
        else:
            print(f"YouTube API Failed: {response.text}")
    except Exception as e:
        print(f"YouTube Exception: {e}")

def verify_twitch():
    print("\n--- Verifying Twitch ---")
    # Get Token
    auth_url = "https://id.twitch.tv/oauth2/token"
    auth_params = {
        "client_id": TWITCH_CLIENT_ID,
        "client_secret": TWITCH_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    try:
        auth_res = requests.post(auth_url, params=auth_params)
        if auth_res.status_code != 200:
            print(f"Twitch Auth Failed: {auth_res.text}")
            return
        
        token = auth_res.json()["access_token"]
        print("Twitch Access Token Obtained.")
        
        # Get Streams
        helix_url = "https://api.twitch.tv/helix/streams"
        headers = {
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": f"Bearer {token}"
        }
        params = {"first": 1}
        
        res = requests.get(helix_url, headers=headers, params=params)
        print(f"Streams Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            if "data" in data and len(data["data"]) > 0:
                print("Successfully fetched Twitch streams.")
                print(f"Sample Thumbnail URL: {data['data'][0].get('thumbnail_url')}")
            else:
                print("Fetched data but 'data' list is empty.")
        else:
            print(f"Twitch Streams Failed: {res.text}")
            
    except Exception as e:
        print(f"Twitch Exception: {e}")

if __name__ == "__main__":
    verify_youtube()
    verify_twitch()
