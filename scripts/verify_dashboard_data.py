import urllib.request
import json

API_BASE = "http://localhost:5000"

def verify_dashboard():
    print("Verifying Dashboard Data Source...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/api/dashboard") as response:
            data = json.loads(response.read().decode())
            
        print(f"Data Source: {data.get('data_source', 'static_csv')}")
        print(f"Total Voters: {data.get('total_voters')}")
        print(f"Constituencies: {data.get('constituencies_count')}")
        
        # Check if it matches our expectations (3850 voters from 2 uploads)
        if data.get('data_source') == 'user_uploads':
            print("✅ Dashboard is using YOUR uploaded data!")
            if data.get('total_voters') == 3850:
                print("✅ Voter count matches expected test data (3850).")
            else:
                print(f"⚠️ Voter count {data.get('total_voters')} differs from expected (3850). Did you upload other files?")
        else:
            print("❌ Dashboard is still using Static CSV (Demo Data). Check backend logic.")
            
    except Exception as e:
        print(f"❌ Failed to fetch dashboard: {e}")

if __name__ == "__main__":
    verify_dashboard()
