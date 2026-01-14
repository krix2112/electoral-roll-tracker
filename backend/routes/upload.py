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
            # Smart Detection Logic: Attempt to find columns by content content
            print(f"Standard headers missing. Attempting smart detection for file: {file.filename}")
            
            # Helper: Check patterns
            import re
            
            # Reload as headerless to treat first row as data
            try:
                file.seek(0)
                df_raw = pd.read_csv(file, header=None, encoding=encoding_used)
            except Exception:
                # If reload fails, rely on original df (though headers might be messed up)
                df_raw = df.copy()

            # We need at least 3 columns for minimal viable data (ID, Name, Age/Address)
            if len(df_raw.columns) >= 3:
                column_mapping = {}
                used_indices = set()
                
                # 1. Find Voter ID (Pattern: AN000048, alphanumeric, usually starts with letters)
                voter_id_pattern = re.compile(r'^[A-Z]{2,4}[0-9]+$', re.IGNORECASE)
                best_id_idx = -1
                best_id_score = 0
                
                for col in df_raw.columns:
                    # Check first 10 non-empty values
                    sample = df_raw[col].astype(str).str.strip()
                    sample = sample[sample != 'nan'].head(20)
                    if sample.empty: continue
                    
                    matches = sample.apply(lambda x: bool(voter_id_pattern.match(x)))
                    score = matches.mean()
                    
                    if score > 0.8 and score > best_id_score:
                        best_id_score = score
                        best_id_idx = col

                if best_id_idx != -1:
                    column_mapping[best_id_idx] = 'voter_id'
                    used_indices.add(best_id_idx)
                
                # 2. Find Age (Numeric, 18-120)
                best_age_idx = -1
                best_age_score = 0
                
                for col in df_raw.columns:
                    if col in used_indices: continue
                    
                    # Convert to numeric, errors='coerce' turns strings to NaN
                    numeric_series = pd.to_numeric(df_raw[col], errors='coerce')
                    valid_ages = (numeric_series >= 18) & (numeric_series <= 120)
                    
                    if len(numeric_series.dropna()) == 0: continue
                    
                    # Score is Ratio of valid ages to total non-null values
                    score = valid_ages.sum() / len(numeric_series.dropna())
                    
                    # Also check that it's MOSTLY integers (standard deviation shouldn't be massive for ages, but range is small)
                    # The content check is strong enough
                    if score > 0.8 and score > best_age_score:
                        best_age_score = score
                        best_age_idx = col
                        
                if best_age_idx != -1:
                    column_mapping[best_age_idx] = 'age'
                    used_indices.add(best_age_idx)

                # 3. Find Name (String, not numeric, not ID, average length > 3)
                # This is harder to distinguish from address. Name is usually before address?
                # Heuristic: Name is usually the text column with shorter average length than address
                
                text_cols = []
                for col in df_raw.columns:
                    if col in used_indices: continue
                    
                    # Check if mostly text (not valid numbers)
                    numeric_check = pd.to_numeric(df_raw[col], errors='coerce')
                    if numeric_check.notna().mean() > 0.5: continue # Mostly numbers, skip
                    
                    sample = df_raw[col].astype(str).str.strip()
                    avg_len = sample.str.len().mean()
                    text_cols.append((col, avg_len))
                
                # Sort text columns by length. Name is usually shorter than Address.
                text_cols.sort(key=lambda x: x[1])
                
                if len(text_cols) >= 1:
                    column_mapping[text_cols[0][0]] = 'name'
                    used_indices.add(text_cols[0][0])
                if len(text_cols) >= 2:
                    column_mapping[text_cols[1][0]] = 'address'
                    used_indices.add(text_cols[1][0])
                
                # Apply mapping if we found at least Voter ID and Name
                if 'voter_id' in column_mapping.values() and 'name' in column_mapping.values():
                    print(f"Smart Detection successful. Mapping: {column_mapping}")
                    df = df_raw.rename(columns=column_mapping)
                    
                    # Ensure required columns exist, fill missing with defaults
                    if 'age' not in df.columns: df['age'] = 0
                    if 'address' not in df.columns: df['address'] = 'Unknown'
                    if 'registration_date' not in df.columns: df['registration_date'] = '2025-01-01'
                    
                    # Re-validate with the new df
                    missing_columns = [] 
                else:
                     print("Smart Detection failed to identify required columns (Voter ID, Name)")

        if missing_columns:
            return {
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'filename': file.filename,
                'required_columns': REQUIRED_COLUMNS,
                'found_columns': list(df.columns),
                'suggestion': 'Please ensure your CSV contains headers: voter_id, name, age, address.'
            }
        
        # Edge Case 8: Check for completely empty rows
        df = df.dropna(how='all')  # Remove rows where all values are NaN
        if df.empty:
            return {'error': 'CSV file contains no valid data rows', 'filename': file.filename}

        # Clean data: strip whitespace from string columns BEFORE validation
        # Ensure columns exist before accessing (incase smart detection filled them)
        for col in ['voter_id', 'name', 'address', 'registration_date']:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()
        
        # Edge Case 9: Validate data types and handle invalid values
        validation_errors = []
        
        # Check voter_id: must be non-null string
        null_voter_ids = df[df['voter_id'].isna() | (df['voter_id'] == '') | (df['voter_id'] == 'nan')]
        if not null_voter_ids.empty:
            validation_errors.append(f'{len(null_voter_ids)} rows have empty or null voter_id')
        
        # Check age: must be valid integer
        try:
            df['age'] = pd.to_numeric(df['age'], errors='coerce').fillna(0).astype(int)
            # Relax age check for headerless files (might have caught a header row as data, ignore single failures)
        except Exception:
            validation_errors.append('Age column contains non-numeric values')
        
        # Check name
        null_names = df[df['name'].isna() | (df['name'] == '')]
        if not null_names.empty:
            # Don't fail hard on names for now, just warn or filter?
            # User wants it to run. Let's just filter out bad rows later.
            pass

        # Default registration date if missing (common in custom files)
        if 'registration_date' not in df.columns or df['registration_date'].isna().all():
             df['registration_date'] = '2025-01-01'

        # Force registration_date format
        try:
            # If it looks like a date, keep it, else default
            pd.to_datetime(df['registration_date'], errors='coerce', format='%Y-%m-%d')
            # Fill NaTs with default
            mask = pd.to_datetime(df['registration_date'], errors='coerce').isna()
            df.loc[mask, 'registration_date'] = '2025-01-01'
        except (ValueError, TypeError):
             df['registration_date'] = '2025-01-01'

        if validation_errors and len(validation_errors) > len(df) * 0.5: # Only fail if > 50% rows are bad
             return {
                'error': 'Data validation failed (Too many invalid rows)',
                'details': validation_errors[:5]
            }

        # Convert age to int
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
