import requests
import datetime
import os
from config import YOUTUBE_API_KEY

def fetch_youtube_trends(region='US', limit=100):
    if not YOUTUBE_API_KEY:
        print("YouTube API Key missing.")
        return []

    print(f"Fetching YouTube trends for {region}...")
    if not YOUTUBE_API_KEY:
        print("Error: YOUTUBE_API_KEY is empty or None")
        return []
        
    print(f"Debug: Key starts with {YOUTUBE_API_KEY[:4]}...")
    
    url = "https://www.googleapis.com/youtube/v3/videos"
    trends = []
    next_page_token = None
    
    while len(trends) < limit:
        # Calculate how many to fetch in this batch (max 50 per API rule)
        remaining = limit - len(trends)
        batch_size = min(50, remaining)
        
        params = {
            "part": "snippet,statistics",
            "chart": "mostPopular",
            "regionCode": region,
            "maxResults": batch_size,
            "key": YOUTUBE_API_KEY
        }
        
        if next_page_token:
            params["pageToken"] = next_page_token

        try:
            response = requests.get(url, params=params)
            # print(f"Debug: YouTube Response Status: {response.status_code}") 
            
            if response.status_code != 200:
                print(f"Debug: YouTube Response Error: {response.text}")
                break

            data = response.json()
            
            if "error" in data:
                print(f"YouTube API Error: {data['error']['message']}")
                break
                
            items = data.get("items", [])
            if not items:
                break

            for item in items:
                # Basic Trend Score Calculation
                published_at = datetime.datetime.fromisoformat(item['snippet']['publishedAt'].replace('Z', '+00:00'))
                now = datetime.datetime.now(datetime.timezone.utc)
                days_since_published = max(1, (now - published_at).total_seconds() / 86400)
                
                view_count = int(item['statistics'].get('viewCount', 0))
                velocity = view_count / days_since_published
                
                trends.append({
                    "platform": "youtube",
                    "external_id": item['id'],
                    "title": item['snippet']['title'],
                    "description": item['snippet']['description'][:500],
                    "channel_title": item['snippet']['channelTitle'],
                    "category": item['snippet']['categoryId'],
                    "thumbnail": item['snippet']['thumbnails'].get('maxres', item['snippet']['thumbnails'].get('standard', item['snippet']['thumbnails'].get('high', item['snippet']['thumbnails']['default'])))['url'],
                    "url": f"https://www.youtube.com/watch?v={item['id']}",
                    "region": region,
                    "published_at": item['snippet']['publishedAt'],
                    "metrics": {
                        "views": view_count,
                        "likes": int(item['statistics'].get('likeCount', 0)),
                        "comments": int(item['statistics'].get('commentCount', 0))
                    },
                    "trend_score": velocity,
                    "last_updated": datetime.datetime.now().isoformat()
                })
            
            next_page_token = data.get("nextPageToken")
            if not next_page_token:
                break
                
        except Exception as e:
            print(f"Error fetching YouTube trends: {e}")
            break
            

        
    return trends
