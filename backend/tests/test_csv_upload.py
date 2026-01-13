"""
Test CSV Upload and Parsing
Owner: Vansh (Backend Developer)
Tests pandas CSV parsing and upload endpoint functionality
"""

import pytest
import pandas as pd
import os
import sys
import tempfile
import uuid
from io import StringIO, BytesIO

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import db
from models import ElectoralRoll, VoterRecord


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


@pytest.fixture
def sample_csv_data():
    """Create sample CSV data for testing"""
    data = """voter_id,name,age,address,registration_date
V000001,Raj Sharma,25,"123 MG Road, Delhi - 110001",2020-01-15
V000002,Priya Patel,30,"456 Gandhi Nagar, Mumbai - 400001",2019-03-20
V000003,Amit Kumar,28,"789 Park Street, Bangalore - 560001",2021-05-10
V000004,Anjali Singh,35,"321 Main Road, Chennai - 600001",2018-07-25
V000005,Vikram Reddy,22,"654 MG Road, Hyderabad - 500001",2022-09-30"""
    return data


def test_pandas_csv_parsing(sample_csv_data):
    """Test 1: Verify pandas can parse CSV correctly"""
    print("\n[TEST 1] Testing pandas CSV parsing...")
    
    df = pd.read_csv(StringIO(sample_csv_data))
    
    # Verify columns exist
    required_columns = ['voter_id', 'name', 'age', 'address', 'registration_date']
    assert all(col in df.columns for col in required_columns), "Missing required columns"
    print(f"  [OK] All required columns present: {required_columns}")
    
    # Verify data types
    assert df['voter_id'].dtype == 'object', "voter_id should be string"
    assert df['name'].dtype == 'object', "name should be string"
    assert df['age'].dtype == 'int64', "age should be integer"
    assert df['address'].dtype == 'object', "address should be string"
    assert df['registration_date'].dtype == 'object', "registration_date should be string"
    print(f"  [OK] Data types validated")
    
    # Verify row count
    assert len(df) == 5, f"Expected 5 rows, got {len(df)}"
    print(f"  [OK] Row count validated: {len(df)} rows")
    
    # Verify specific data
    assert df.iloc[0]['voter_id'] == 'V000001', "First voter_id incorrect"
    assert df.iloc[0]['name'] == 'Raj Sharma', "First name incorrect"
    assert df.iloc[0]['age'] == 25, "First age incorrect"
    print(f"  [OK] Sample data validated")
    
    print("  [PASSED] Test 1: pandas CSV parsing works correctly\n")


def test_csv_upload_endpoint(client, sample_csv_data):
    """Test 2: Test upload endpoint with CSV file"""
    print("[TEST 2] Testing CSV upload endpoint...")
    
    # Create a file-like object
    csv_file = BytesIO(sample_csv_data.encode('utf-8'))
    csv_file.name = 'test_electoral_roll.csv'
    
    response = client.post(
        '/api/upload',
        data={'file': (csv_file, 'test_electoral_roll.csv')},
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.get_json()}"
    print(f"  [OK] Upload endpoint responded with status 201")
    
    data = response.get_json()
    assert 'upload_id' in data, "Response missing upload_id"
    assert 'filename' in data, "Response missing filename"
    assert 'row_count' in data, "Response missing row_count"
    assert data['filename'] == 'test_electoral_roll.csv', "Filename incorrect"
    assert data['row_count'] == 5, f"Expected 5 rows, got {data['row_count']}"
    print(f"  [OK] Response data validated")
    
    # Verify data was saved to database
    with app.app_context():
        electoral_roll = ElectoralRoll.query.filter_by(upload_id=data['upload_id']).first()
        assert electoral_roll is not None, "ElectoralRoll not saved to database"
        assert electoral_roll.row_count == 5, "Row count incorrect in database"
        print(f"  [OK] Data saved to database")
        
        voter_records = VoterRecord.query.filter_by(upload_id=data['upload_id']).all()
        assert len(voter_records) == 5, f"Expected 5 voter records, got {len(voter_records)}"
        print(f"  [OK] Voter records saved: {len(voter_records)} records")
        
        # Verify first record
        first_record = VoterRecord.query.filter_by(
            upload_id=data['upload_id'],
            voter_id='V000001'
        ).first()
        assert first_record is not None, "First voter record not found"
        assert first_record.name == 'Raj Sharma', "Name incorrect"
        assert first_record.age == 25, "Age incorrect"
        print(f"  [OK] First record validated: {first_record.name}, Age: {first_record.age}")
    
    print("  [PASSED] Test 2: CSV upload endpoint works correctly\n")


def test_missing_columns(client):
    """Test 3: Test validation for missing columns"""
    print("[TEST 3] Testing missing columns validation...")
    
    # CSV with missing 'age' column
    invalid_csv = """voter_id,name,address,registration_date
V000001,Raj Sharma,"123 MG Road, Delhi",2020-01-15"""
    
    csv_file = BytesIO(invalid_csv.encode('utf-8'))
    csv_file.name = 'invalid_roll.csv'
    
    response = client.post(
        '/api/upload',
        data={'file': (csv_file, 'invalid_roll.csv')},
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    data = response.get_json()
    assert 'error' in data, "Error message missing"
    assert 'Missing required columns' in data['error'], "Error message incorrect"
    print(f"  [OK] Missing columns validation works: {data['error']}")
    
    print("  [PASSED] Test 3: Missing columns validation works correctly\n")


def test_empty_file(client):
    """Test 4: Test empty file handling"""
    print("[TEST 4] Testing empty file handling...")
    
    empty_file = BytesIO(b'')
    empty_file.name = 'empty.csv'
    
    response = client.post(
        '/api/upload',
        data={'file': (empty_file, 'empty.csv')},
        content_type='multipart/form-data'
    )
    
    # Should either fail or handle gracefully
    assert response.status_code in [400, 500], f"Expected 400/500, got {response.status_code}"
    print(f"  [OK] Empty file handled correctly (status: {response.status_code})")
    
    print("  [PASSED] Test 4: Empty file handling works correctly\n")


def test_invalid_file_type(client):
    """Test 5: Test invalid file type rejection"""
    print("[TEST 5] Testing invalid file type rejection...")
    
    text_file = BytesIO(b'This is not a CSV file')
    text_file.name = 'test.txt'
    
    response = client.post(
        '/api/upload',
        data={'file': (text_file, 'test.txt')},
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 400, f"Expected 400, got {response.status_code}"
    data = response.get_json()
    assert 'error' in data, "Error message missing"
    assert 'CSV' in data['error'], "Error message should mention CSV"
    print(f"  [OK] Invalid file type rejected: {data['error']}")
    
    print("  [PASSED] Test 5: Invalid file type rejection works correctly\n")


def test_large_csv_handling(client):
    """Test 6: Test handling of larger CSV files"""
    print("[TEST 6] Testing large CSV file handling...")
    
    # Generate a CSV with 1000 rows
    rows = []
    rows.append('voter_id,name,age,address,registration_date')
    for i in range(1000):
        rows.append(f'V{str(i+1).zfill(6)},Test User {i+1},{20+i%60},Address {i+1},2020-01-{(i%28)+1:02d}')
    
    large_csv = '\n'.join(rows)
    csv_file = BytesIO(large_csv.encode('utf-8'))
    csv_file.name = 'large_roll.csv'
    
    response = client.post(
        '/api/upload',
        data={'file': (csv_file, 'large_roll.csv')},
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    data = response.get_json()
    assert data['row_count'] == 1000, f"Expected 1000 rows, got {data['row_count']}"
    print(f"  [OK] Large CSV processed: {data['row_count']} rows")
    
    # Verify all records saved
    with app.app_context():
        voter_records = VoterRecord.query.filter_by(upload_id=data['upload_id']).all()
        assert len(voter_records) == 1000, f"Expected 1000 records in DB, got {len(voter_records)}"
        print(f"  [OK] All {len(voter_records)} records saved to database")
    
    print("  [PASSED] Test 6: Large CSV handling works correctly\n")


def test_row_hash_generation(client, sample_csv_data):
    """Test 7: Verify row hashing works correctly"""
    print("[TEST 7] Testing row hash generation...")
    
    from diff_engine import calculate_row_hash
    
    # Test hash calculation
    row_data = {
        'voter_id': 'V000001',
        'name': 'Raj Sharma',
        'age': 25,
        'address': '123 MG Road, Delhi - 110001',
        'registration_date': '2020-01-15'
    }
    
    hash1 = calculate_row_hash(row_data)
    assert len(hash1) == 32, "Hash should be 32 characters (MD5)"
    print(f"  [OK] Hash generated: {hash1[:8]}...")
    
    # Same data should produce same hash
    hash2 = calculate_row_hash(row_data)
    assert hash1 == hash2, "Same data should produce same hash"
    print(f"  [OK] Hash is deterministic")
    
    # Different data should produce different hash
    row_data['age'] = 26
    hash3 = calculate_row_hash(row_data)
    assert hash1 != hash3, "Different data should produce different hash"
    print(f"  [OK] Hash changes with data changes")
    
    print("  [PASSED] Test 7: Row hash generation works correctly\n")


if __name__ == '__main__':
    print("="*70)
    print("CSV UPLOAD & PARSING TEST SUITE")
    print("Owner: Vansh (Backend Developer)")
    print("="*70)
    
    # Run tests
    pytest.main([__file__, '-v', '-s'])
