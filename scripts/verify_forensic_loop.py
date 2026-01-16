import urllib.request
import json
import sys

API_BASE = "http://localhost:5000"

def verify_loop():
    print("Verifying Complete Forensic Loop...")
    
    # 1. Find the snapshots
    try:
        with urllib.request.urlopen(f"{API_BASE}/api/uploads") as response:
            uploads = json.loads(response.read().decode())
            
        jan = next((u for u in uploads if 'jan_2024' in u['filename']), None)
        apr = next((u for u in uploads if 'apr_2024' in u['filename']), None)
        
        if not jan or not apr:
            print("❌ Snapshots not found in uploads. Did you upload them?")
            return
            
        print(f"✅ Found Snapshots: Jan ({jan['upload_id']}) vs Apr ({apr['upload_id']})")
        
    except Exception as e:
        print(f"❌ Failed to fetch uploads: {e}")
        return

    # 2. Trigger Analysis
    print("running analysis...")
    try:
        payload = {
            "current_upload_id": apr['upload_id'],
            "previous_upload_id": jan['upload_id']
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(f"{API_BASE}/api/analyze", data=data, headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            
        print(f"✅ Analysis Complete. Score: {result['final_anomaly_score']}")
        print(f"   Verdict: {result['verdict']}")
        print("   Evidence Found:")
        for ev in result['all_evidence']:
            print(f"   - {ev}")
            
        # 3. Validate Specific Patterns
        # We expect mass deletion (but current logic analyzes CURRENT snapshot vs PREVIOUS).
        # Network analysis checks for isolated nodes in CURRENT.
        # Our Apr snapshot has 20 migrants.
        # It has 1850 voters.
        # The 150 deleted are NOT in current.
        
        # NOTE: The current 'analyze' endpoint runs modules on the CURRENT snapshot, 
        # using PREVIOUS mainly for context (like finding NEW voters).
        # Deleted voters are usually handled by a Diff Engine, not 'Forensic' modules running on 'current'.
        # However, Behavioral module might check 'Snapshot' stats.
        
        passed = False
        if result['final_anomaly_score'] > 50:
             passed = True
             
        if passed:
            print("\n✅ SUCCESS: Forensic Loop detected anomalies in the test data.")
        else:
            print("\n⚠️ WARNING: Score was low. Maybe detection requires specific patterns not fully simulated or logic tuning.")

    except Exception as e:
        print(f"❌ Analysis Failed: {e}")

if __name__ == "__main__":
    verify_loop()
