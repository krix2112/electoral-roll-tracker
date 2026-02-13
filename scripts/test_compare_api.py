import requests
import sqlite3
import os
import json

API_URL = "http://localhost:5000/api/compare"
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'instance', 'electoral_roll_db.sqlite')

def get_latest_uploads():
    if not os.path.exists(DB_PATH):
        print("DB not found")
        return []
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT upload_id, filename FROM electoral_rolls ORDER BY id DESC LIMIT 2")
    uploads = cursor.fetchall()
    conn.close()
    return uploads

def test_compare():
    uploads = get_latest_uploads()
    if len(uploads) < 2:
        print("Not enough uploads to compare.")
        return

    new_id = uploads[0][0]
    old_id = uploads[1][0]
    
    print(f"Comparing New: {new_id} ({uploads[0][1]}) vs Old: {old_id} ({uploads[1][1]})")
    
    try:
        response = requests.post(API_URL, json={
            'old_upload_id': old_id,
            'new_upload_id': new_id
        })
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Comparison Success!")
            print(f"Added: {len(data.get('added', []))}")
            print(f"Deleted: {len(data.get('deleted', []))}")
            print(f"Modified: {len(data.get('modified', []))}")
            
            # Print sample to see if fields look right
            if data.get('added'):
                print("Sample Added:", data['added'][0])
        else:
            print(f"Comparison Failed: {response.text}")
            
    except Exception as e:
        print(f"Request Error: {e}")

if __name__ == "__main__":
    test_compare()
