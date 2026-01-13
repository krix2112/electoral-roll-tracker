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
    """
    Upload Electoral Roll CSV File
    
    Handles CSV file uploads with comprehensive edge-case handling:
    - Empty files
    - Malformed CSV
    - Missing columns
    - Invalid data types
    - Duplicate voter IDs
    - Large files (handled in batches)
    """
    # Edge Case 1: No file in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Edge Case 2: Empty filename
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Edge Case 3: Invalid file extension
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Only CSV files are supported'}), 400
    
    # Get State from request
    state = request.form.get('state')
    if not state or state == 'undefined' or state == 'null':
        return jsonify({'error': 'State is required'}), 400
    
    # Edge Case 4: Check file size (before processing)
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    if file_size == 0:
        return jsonify({'error': 'File is empty'}), 400
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    if file_size > MAX_FILE_SIZE:
        return jsonify({'error': f'File too large. Maximum size is 50MB. Your file is {file_size / (1024*1024):.2f}MB'}), 413
    
    try:
        # Edge Case 5: Try multiple encodings for CSV parsing
        encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
        df = None
        encoding_used = None
        
        for encoding in encodings:
            try:
                file.seek(0)  # Reset file pointer
                df = pd.read_csv(file, encoding=encoding)
                encoding_used = encoding
                break
            except (UnicodeDecodeError, pd.errors.ParserError):
                continue
        
        if df is None:
            return jsonify({'error': 'Unable to parse CSV file. Please ensure it is a valid CSV file with proper encoding'}), 400
        
        # Edge Case 6: Empty DataFrame (only headers or completely empty)
        if df.empty:
            return jsonify({'error': 'CSV file is empty or contains no data rows'}), 400
        
        # Edge Case 7: Missing required columns
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'required_columns': REQUIRED_COLUMNS,
                'found_columns': list(df.columns)
            }), 400
        
        # Edge Case 8: Check for completely empty rows
        df = df.dropna(how='all')  # Remove rows where all values are NaN
        if df.empty:
            return jsonify({'error': 'CSV file contains no valid data rows'}), 400
        
        # Edge Case 9: Validate data types and handle invalid values
        validation_errors = []
        
        # Check voter_id: must be non-null string
        null_voter_ids = df[df['voter_id'].isna() | (df['voter_id'].astype(str).str.strip() == '')]
        if not null_voter_ids.empty:
            validation_errors.append(f'{len(null_voter_ids)} rows have empty or null voter_id')
        
        # Check age: must be valid integer
        try:
            df['age'] = pd.to_numeric(df['age'], errors='coerce')
            invalid_ages = df[df['age'].isna() | (df['age'] < 0) | (df['age'] > 150)]
            if not invalid_ages.empty:
                validation_errors.append(f'{len(invalid_ages)} rows have invalid age values')
        except Exception:
            validation_errors.append('Age column contains non-numeric values')
        
        # Check name: must be non-null string
        null_names = df[df['name'].isna() | (df['name'].astype(str).str.strip() == '')]
        if not null_names.empty:
            validation_errors.append(f'{len(null_names)} rows have empty or null name')
        
        # Check address: must be non-null string
        null_addresses = df[df['address'].isna() | (df['address'].astype(str).str.strip() == '')]
        if not null_addresses.empty:
            validation_errors.append(f'{len(null_addresses)} rows have empty or null address')
        
        # Check registration_date: basic format validation
        try:
            pd.to_datetime(df['registration_date'], errors='raise', format='%Y-%m-%d')
        except (ValueError, TypeError):
            validation_errors.append('registration_date must be in YYYY-MM-DD format')
        
        if validation_errors:
            return jsonify({
                'error': 'Data validation failed',
                'details': validation_errors,
                'row_count': len(df)
            }), 400
        
        # Edge Case 10: Check for duplicate voter_ids within the file
        duplicate_voter_ids = df[df.duplicated(subset=['voter_id'], keep=False)]
        if not duplicate_voter_ids.empty:
            duplicate_count = len(duplicate_voter_ids)
            return jsonify({
                'error': f'Duplicate voter_id found in file',
                'details': f'{duplicate_count} rows have duplicate voter_id values',
                'duplicate_ids': duplicate_voter_ids['voter_id'].unique().tolist()[:10]  # Show first 10
            }), 400
        
        # Clean data: strip whitespace from string columns
        for col in ['voter_id', 'name', 'address', 'registration_date']:
            df[col] = df[col].astype(str).str.strip()
        
        # Convert age to int (already validated)
        df['age'] = df['age'].astype(int)
        
        upload_id = str(uuid.uuid4())
        
        # Calculate row hashes
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
            state=state,
            row_count=len(df),
            data_hash=dataset_hash
        )
        db.session.add(electoral_roll)
        
        # Edge Case 11: Handle large files with batch processing
        batch_size = 1000
        total_batches = (len(df) + batch_size - 1) // batch_size
        
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            voter_records = []
            
            for _, row in batch.iterrows():
                try:
                    voter_records.append(
                        VoterRecord(
                            upload_id=upload_id,
                            voter_id=str(row['voter_id']),
                            name=str(row['name']),
                            age=int(row['age']),
                            address=str(row['address']),
                            registration_date=str(row['registration_date']),
                            row_hash=row['row_hash']
                        )
                    )
                except Exception as row_error:
                    # Edge Case 12: Handle individual row errors
                    return jsonify({
                        'error': f'Error processing row: {str(row_error)}',
                        'row_index': i + len(voter_records)
                    }), 400
            
            db.session.bulk_save_objects(voter_records)
        
        db.session.commit()
        
        return jsonify({
            'upload_id': upload_id,
            'filename': file.filename,
            'row_count': len(df),
            'message': 'Upload successful',
            'encoding': encoding_used,
            'batches_processed': total_batches
        }), 201
        
    except pd.errors.EmptyDataError:
        db.session.rollback()
        return jsonify({'error': 'CSV file is empty or contains no valid data'}), 400
    except pd.errors.ParserError as e:
        db.session.rollback()
        return jsonify({'error': f'CSV parsing error: {str(e)}. Please check file format'}), 400
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'Data validation error: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500
