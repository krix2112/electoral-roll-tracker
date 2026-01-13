
import sys
import os
import unittest
import io
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import db
from models import ElectoralRoll

class TestStateFiltering(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' # Use memory DB for speed and isolation
        app.config['WTF_CSRF_ENABLED'] = False
        self.app = app
        self.client = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_filtering_logic(self):
        print("\n[VERIFY] Starting State Filtering verification...")
        
        # Helper to upload file
        def upload_file(filename, state, content="voter_id,name,age,address,registration_date\nV1,A,20,Addr,2020-01-01"):
            return self.client.post('/api/upload', data={
                'file': (io.BytesIO(content.encode('utf-8')), filename),
                'state': state
            }, content_type='multipart/form-data')

        # 1. Upload Andaman Data
        print("[VERIFY] Uploading Andaman data...")
        res1 = upload_file('andaman.csv', 'Andaman & Nicobar')
        self.assertEqual(res1.status_code, 201)
        
        # 2. Upload Maharashtra Data
        print("[VERIFY] Uploading Maharashtra data...")
        res2 = upload_file('mh.csv', 'Maharashtra')
        self.assertEqual(res2.status_code, 201)
        
        # 3. Check Stats for Andaman
        print("[VERIFY] Checking stats for Andaman & Nicobar...")
        stats_andaman = self.client.get('/api/stats?state=Andaman & Nicobar').get_json()
        self.assertEqual(stats_andaman['voters']['raw'], 1, "Should have 1 voter for Andaman")
        
        # 4. Check Stats for Maharashtra
        print("[VERIFY] Checking stats for Maharashtra...")
        stats_mh = self.client.get('/api/stats?state=Maharashtra').get_json()
        self.assertEqual(stats_mh['voters']['raw'], 1, "Should have 1 voter for Maharashtra")
        
        # 5. Check Stats for Delhi (No data)
        print("[VERIFY] Checking stats for Delhi (should be empty)...")
        stats_delhi = self.client.get('/api/stats?state=Delhi').get_json()
        self.assertEqual(stats_delhi['voters']['raw'], 0, "Should have 0 voters for Delhi")
        
        print("[SUCCESS] State filtering is working correctly!")

if __name__ == '__main__':
    unittest.main()
