import requests
import pandas as pd
import io

# API URL (assuming default port 5000)
API_URL = "http://localhost:5000/api/upload"

def test_upload():
    # Create valid CSV content
    csv_content = """voter_id,name,age,address,registration_date,constituency
TEST001,John Doe,30,123 Main St,2024-01-01,Ward 1
TEST002,Jane Smith,25,456 Elm St,2024-01-02,Ward 2"""
    
    files = {
        'file': ('test_upload.csv', csv_content, 'text/csv')
    }
    
    data = {
        'state': 'Delhi'
    }
    
    try:
        response = requests.post(API_URL, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201 or response.status_code == 200:
            result = response.json()
            print("Upload Success!")
            if '_debug' in result:
                print("\n--- DEBUG INFO FROM SERVER ---")
                print(f"DB URL: {result['_debug']['db_url']}")
                print(f"Constituency Sample: {result['_debug']['constituency_sample']}")
                print(f"Voter Sample: {result['_debug']['voter_sample']}")
            else:
                print("No _debug info returned (maybe server not reloaded?)")
        else:
            print(f"Upload Failed: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_upload()
