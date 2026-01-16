import urllib.request
import json
import sys

API_BASE = "http://localhost:5000"

def check_integration():
    print(f"Checking integration with {API_BASE}...")
    
    # 1. Health Check
    try:
        with urllib.request.urlopen(f"{API_BASE}/api/forensic-health") as response:
            health = json.loads(response.read().decode())
            print(f"✅ Backend Health: {health['status']}")
    except Exception as e:
        print(f"❌ Backend Health Check Failed: {e}")
        return

    # 2. Fetch Uploads
    try:
        with urllib.request.urlopen(f"{API_BASE}/api/uploads") as response:
            uploads = json.loads(response.read().decode())
            print(f"✅ Fetch Uploads: Found {len(uploads)} files")
            if not uploads:
                print("⚠️ No uploads found. Cannot test analysis.")
                return
            latest_upload = uploads[0]
            print(f"   Latest File: {latest_upload['filename']} (ID: {latest_upload['upload_id']})")
    except Exception as e:
        print(f"❌ Fetch Uploads Failed: {e}")
        return

    # 3. Run Analysis
    try:
        data = json.dumps({"current_upload_id": latest_upload['upload_id']}).encode('utf-8')
        req = urllib.request.Request(f"{API_BASE}/api/analyze", data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            analysis = json.loads(response.read().decode())
            print(f"✅ Forensic Analysis Result:")
            print(f"   Score: {analysis['final_anomaly_score']}")
            print(f"   Verdict: {analysis['verdict']}")
            print(f"   Analysis ID: {analysis['analysis_id']}")
            
            # Check if it's mock data (mock usually has score 87.5 and specific ID)
            if analysis['analysis_id'] == 'demo_analysis_001':
                 print("⚠️ WARNING: Returned data appears to be DEMO mock data (ID matches demo).")
            else:
                 print("✅ Data appears to be REAL analysis (ID is generated).")

    except Exception as e:
        print(f"❌ Analysis Failed: {e}")
        return

if __name__ == "__main__":
    check_integration()
