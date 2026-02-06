import requests
import os
from dotenv import load_dotenv

# Load explicitly from the root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing env vars")
    exit(1)

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Range": "0-0",
    "Prefer": "count=exact"
}

url = f"{SUPABASE_URL}/rest/v1/trends_cache"
params = {
    "platform": "eq.youtube",
    "select": "count"
}

try:
    response = requests.get(url, headers=headers, params=params)
    print(f"Status Code: {response.status_code}")
    print(f"Content Range: {response.headers.get('Content-Range')}")
except Exception as e:
    print(f"Error: {e}")
