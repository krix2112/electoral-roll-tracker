"""Upload Route - Handle CSV file uploads"""
from flask import Blueprint, request, jsonify
import pandas as pd
import uuid
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import db
from models import ElectoralRoll, VoterRecord
from diff_engine import calculate_row_hash, calculate_dataset_hash

upload_bp = Blueprint('upload', __name__)
REQUIRED_COLUMNS = ['voter_id', 'name', 'age', 'address', 'registration_date']

@upload_bp.route('/api/upload', methods=['POST'])
def upload_electoral_roll():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
    
    try:
        df = pd.read_csv(file, encoding='utf-8')
        
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            return jsonify({'error': f'Missing required columns: {", ".join(missing_columns)}'}), 400
        
        upload_id = str(uuid.uuid4())
        
        df['row_hash'] = df.apply(lambda row: calculate_row_hash({
            'voter_id': row['voter_id'],
            'name': row['name'],
            'age': row['age'],
            'address': row['address'],
            'registration_date': row['registration_date']
        }), axis=1)
        
        dataset_hash = calculate_dataset_hash(df[REQUIRED_COLUMNS])
        
        electoral_roll = ElectoralRoll(
            upload_id=upload_id,
            filename=file.filename,
            row_count=len(df),
            data_hash=dataset_hash
        )
        db.session.add(electoral_roll)
        
        batch_size = 1000
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            voter_records = [
                VoterRecord(
                    upload_id=upload_id,
                    voter_id=str(row['voter_id']),
                    name=str(row['name']),
                    age=int(row['age']),
                    address=str(row['address']),
                    registration_date=str(row['registration_date']),
                    row_hash=row['row_hash']
                )
                for _, row in batch.iterrows()
            ]
            db.session.bulk_save_objects(voter_records)
        
        db.session.commit()
        
        return jsonify({
            'upload_id': upload_id,
            'filename': file.filename,
            'row_count': len(df),
            'message': 'Upload successful'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500
