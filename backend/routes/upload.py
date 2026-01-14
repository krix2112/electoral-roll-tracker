"""Upload Route - Handle CSV file uploads"""
from flask import Blueprint, request, jsonify
import pandas as pd
import uuid
import sys
import os
import traceback
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import db
from models import ElectoralRoll, VoterRecord, Notification
from diff_engine import calculate_row_hash, calculate_dataset_hash

upload_bp = Blueprint('upload', __name__)
REQUIRED_COLUMNS = ['voter_id', 'name', 'age', 'address', 'registration_date']

def process_single_file(file):
    """
    Process a single CSV file and save to database.
    Returns dict with result or error.
    """
    # Get State from request
    state = request.form.get('state')
    if not state or state == 'undefined' or state == 'null':
        return {'error': 'State is required', 'filename': file.filename if file else 'unknown'}


    try:
        # Edge Case 2: Empty filename
        if file.filename == '':
            return {'error': 'No file selected', 'filename': ''}
        
        # Edge Case 3: Invalid file extension
        if not file.filename.lower().endswith('.csv'):
            return {'error': 'Only CSV files are supported', 'filename': file.filename}
        
        # Edge Case 4: Check file size (before processing)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        if file_size == 0:
            return {'error': 'File is empty', 'filename': file.filename}
        
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
        if file_size > MAX_FILE_SIZE:
            return {'error': f'File too large. Maximum size is 50MB. Your file is {file_size / (1024*1024):.2f}MB', 'filename': file.filename}
        
        # Edge Case 5: Try multiple encodings for CSV parsing
        encodings = ['utf-8-sig', 'utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
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
            return {'error': 'Unable to parse CSV file. Please ensure it is a valid CSV file with proper encoding', 'filename': file.filename}
        
        # Edge Case 6: Empty DataFrame (only headers or completely empty)
        if df.empty:
            return {'error': 'CSV file is empty or contains no data rows', 'filename': file.filename}
        
        # Edge Case 7: Missing required columns
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            return {
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'filename': file.filename,
                'required_columns': REQUIRED_COLUMNS,
                'found_columns': list(df.columns)
            }
        
        # Edge Case 8: Check for completely empty rows
        df = df.dropna(how='all')  # Remove rows where all values are NaN
        if df.empty:
            return {'error': 'CSV file contains no valid data rows', 'filename': file.filename}

        # Clean data: strip whitespace from string columns BEFORE validation
        for col in ['voter_id', 'name', 'address', 'registration_date']:
            df[col] = df[col].astype(str).str.strip()
        
        # Edge Case 9: Validate data types and handle invalid values
        validation_errors = []
        
        # Check voter_id: must be non-null string
        null_voter_ids = df[df['voter_id'].isna() | (df['voter_id'] == '')]
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
        null_names = df[df['name'].isna() | (df['name'] == '')]
        if not null_names.empty:
            validation_errors.append(f'{len(null_names)} rows have empty or null name')
        
        # Check address: must be non-null string
        null_addresses = df[df['address'].isna() | (df['address'] == '')]
        if not null_addresses.empty:
            validation_errors.append(f'{len(null_addresses)} rows have empty or null address')
        
        # Check registration_date: basic format validation
        try:
            pd.to_datetime(df['registration_date'], errors='raise', format='%Y-%m-%d')
        except (ValueError, TypeError):
            validation_errors.append('registration_date must be in YYYY-MM-DD format')
        
        if validation_errors:
            return {
                'error': 'Data validation failed',
                'filename': file.filename,
                'details': validation_errors,
                'row_count': len(df)
            }
        
        # Edge Case 10: Check for duplicate voter_ids within the file
        duplicate_voter_ids = df[df.duplicated(subset=['voter_id'], keep=False)]
        if not duplicate_voter_ids.empty:
            duplicate_count = len(duplicate_voter_ids)
            return {
                'error': f'Duplicate voter_id found in file',
                'filename': file.filename,
                'details': f'{duplicate_count} rows have duplicate voter_id values',
                'duplicate_ids': duplicate_voter_ids['voter_id'].unique().tolist()[:10]
            }
        
        # Convert age to int (already validated)
        df['age'] = df['age'].astype(int)
        
        # Helper to find constituency info
        # Check for constituency in columns (case insensitive) -> if not found check address
        constituency_col = None
        possible_names = ['constituency', 'pc_name', 'ac_name', 'assembly', 'parliamentary', 'ward', 'division', 'region']
        
        for col in df.columns:
            if any(name in col.lower() for name in possible_names):
                constituency_col = col
                break
        
        # Prepare constituency series
        if constituency_col:
            df['constituency_extracted'] = df[constituency_col].astype(str).str.strip()
            # If empty, fill with 'Unknown'
            df['constituency_extracted'] = df['constituency_extracted'].replace('', 'Unknown').fillna('Unknown')
        else:
            # Try to extract "Ward X" from address
            def extract_ward(addr):
                import re
                if not isinstance(addr, str): return 'Unknown'
                match = re.search(r'Ward\s*[-:.]?\s*(\d+)', addr, re.IGNORECASE)
                if match:
                    return f"Ward {match.group(1)}"
                return "General Division" # Default fallback
            
            df['constituency_extracted'] = df['address'].apply(extract_ward)

        # Explicitly reorder columns to ensure consistent hashing
        # We process row hash WITHOUT constituency to maintain compatibility if constituency changes but voter details don't
        # OR we can include it. Let's include it to be precise - if you move constituency, that's a change or re-registration.
        # However, to check for duplicates purely by identity, maybe not?
        # Let's include it in hash for data integrity.
        
        df = df[REQUIRED_COLUMNS + ['constituency_extracted']]
        
        upload_id = str(uuid.uuid4())
        
        # Calculate row hashes
        df['row_hash'] = df.apply(lambda row: calculate_row_hash({
            'voter_id': row['voter_id'],
            'name': row['name'],
            'age': row['age'],
            'address': row['address'],
            'registration_date': row['registration_date'],
            'constituency': row['constituency_extracted']
        }), axis=1)
        
        dataset_hash = calculate_dataset_hash(df[REQUIRED_COLUMNS]) # Keep dataset hash on core columns for now or include all? Let's keep core.
        
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
        
        voter_records_all = []
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            for _, row in batch.iterrows():
                try:
                    voter_records_all.append(
                        VoterRecord(
                            upload_id=upload_id,
                            voter_id=str(row['voter_id']),
                            name=str(row['name']),
                            age=int(row['age']),
                            address=str(row['address']),
                            registration_date=str(row['registration_date']),
                            constituency=str(row['constituency_extracted']),
                            row_hash=row['row_hash']
                        )
                    )
                except Exception as row_error:
                    return {
                        'error': f'Error processing row: {str(row_error)}',
                        'filename': file.filename,
                        'row_index': i + len(voter_records_all)
                    }
        
        db.session.bulk_save_objects(voter_records_all)
        
        # Create success notification
        success_notification = Notification(
            title='Electoral Roll Uploaded',
            message=f'Successfully uploaded "{file.filename}" for state "{state}". {len(df)} records processed.',
            severity='success',
            related_entity=f'Upload-{upload_id[:8]}',
            action_url='/dashboard',
            action_type='navigate'
        )
        db.session.add(success_notification)
        
        db.session.commit()
        
        return {
            'upload_id': upload_id,
            'filename': file.filename,
            'row_count': len(df),
            'status': 'success',
            'encoding': encoding_used
        }

    except pd.errors.EmptyDataError:
        db.session.rollback()
        return {'error': 'CSV file is empty or contains no valid data', 'filename': file.filename}
    except pd.errors.ParserError as e:
        db.session.rollback()
        return {'error': f'CSV parsing error: {str(e)}', 'filename': file.filename}
    except ValueError as e:
        db.session.rollback()
        return {'error': f'Data validation error: {str(e)}', 'filename': file.filename}
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return {'error': f'Upload failed: {str(e)}', 'filename': file.filename}

@upload_bp.route('/api/upload', methods=['POST'])
def upload_electoral_roll():
    """
    Upload Electoral Roll CSV File(s)
    Handles single or multiple file uploads.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    files = request.files.getlist('file')
    
    if not files:
        return jsonify({'error': 'No files selected'}), 400

    results = []
    has_error = False
    
    for file in files:
        result = process_single_file(file)
        results.append(result)
        if 'error' in result:
            has_error = True

    # If only one file and it failed, return error status
    if len(files) == 1 and has_error:
        return jsonify(results[0]), 400
        
    # If multiple files, return 207 Multi-Status (conceptually, but using 200/201 with body details is safer for standard clients)
    # We will return 201 if at least one succeeded, or 400 if all failed.
    
    all_failed = all('error' in r for r in results)
    status_code = 400 if all_failed else 201
    
    # If it was a single file success, existing frontend expects a single object, not a list.
    # To maintain backward compatibility while supporting multi-upload:
    if len(results) == 1:
        if 'error' in results[0]:
            return jsonify(results[0]), 400
        return jsonify(results[0]), 201

    return jsonify({
        'message': 'Batch upload processed',
        'results': results,
        'total_files': len(files),
        'success_count': sum(1 for r in results if 'error' not in r)
    }), status_code
