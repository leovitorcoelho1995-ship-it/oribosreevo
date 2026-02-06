from pytrends.request import TrendReq
import pandas as pd

def fetch_google_trends(region='US'):
    print(f"Fetching Google Trends for {region}...")
    try:
        # Simplified init to avoid 'method_whitelist' error with newer urllib3
        pytrends = TrendReq(hl='en-US', tz=360) 
        
        # Try daily trends first (less strict on blocks)
        # 'united_states' is the code for daily trends (not 'US')
        today_searches = pytrends.trending_searches(pn='united_states')
        
        # Format: DataFrame with one column usually
        # The column name changes, so lets just take values
        if not today_searches.empty:
            trends = []
            for item in today_searches.iloc[:, 0].tolist():
                trends.append({
                    "title": item,
                    "views": 0, # Daily trends don't give volume in this call usually
                    "url": f"https://trends.google.com/trends/explore?q={item}"
                })
            return trends[:20]
            
        return []

    except Exception as e:
        print(f"Error fetching Google Trends: {e}")
        # Return empty list instead of mock to respect user request
        return []
