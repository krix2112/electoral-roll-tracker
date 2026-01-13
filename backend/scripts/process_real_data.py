"""
Process Real Electoral Data for Demo
Owner: Vansh (Backend Developer)
Helper script to process and validate real electoral roll CSV files
"""

import pandas as pd
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

REQUIRED_COLUMNS = ['voter_id', 'name', 'age', 'address', 'registration_date']


def validate_csv_file(csv_path: str) -> dict:
    """
    Validate a CSV file to ensure it matches backend requirements
    
    Returns:
        dict with validation results
    """
    print(f"\n{'='*60}")
    print(f"Validating: {csv_path}")
    print(f"{'='*60}")
    
    try:
        # Read CSV
        df = pd.read_csv(csv_path, encoding='utf-8')
        
        # Check if empty
        if df.empty:
            return {
                'valid': False,
                'error': 'CSV file is empty',
                'row_count': 0
            }
        
        # Check required columns
        missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_columns:
            return {
                'valid': False,
                'error': f'Missing required columns: {", ".join(missing_columns)}',
                'found_columns': list(df.columns),
                'required_columns': REQUIRED_COLUMNS,
                'row_count': len(df)
            }
        
        # Check for null values in required fields
        null_voter_ids = df[df['voter_id'].isna() | (df['voter_id'].astype(str).str.strip() == '')]
        null_names = df[df['name'].isna() | (df['name'].astype(str).str.strip() == '')]
        
        # Check data types
        try:
            df['age'] = pd.to_numeric(df['age'], errors='coerce')
            invalid_ages = df[df['age'].isna() | (df['age'] < 0) | (df['age'] > 150)]
        except Exception:
            invalid_ages = df
        
        # Check for duplicates
        duplicate_voter_ids = df[df.duplicated(subset=['voter_id'], keep=False)]
        
        # Summary
        validation_result = {
            'valid': True,
            'row_count': len(df),
            'warnings': [],
            'errors': []
        }
        
        if not null_voter_ids.empty:
            validation_result['warnings'].append(f'{len(null_voter_ids)} rows have empty voter_id')
        
        if not null_names.empty:
            validation_result['warnings'].append(f'{len(null_names)} rows have empty name')
        
        if not invalid_ages.empty:
            validation_result['warnings'].append(f'{len(invalid_ages)} rows have invalid age values')
        
        if not duplicate_voter_ids.empty:
            validation_result['warnings'].append(f'{len(duplicate_voter_ids)} rows have duplicate voter_id')
        
        # Print summary
        print(f"✅ File is VALID")
        print(f"   Rows: {len(df)}")
        print(f"   Columns: {list(df.columns)}")
        
        if validation_result['warnings']:
            print(f"\n⚠️  Warnings:")
            for warning in validation_result['warnings']:
                print(f"   - {warning}")
        else:
            print(f"\n✅ No warnings - file is perfect!")
        
        # Show sample data
        print(f"\n📋 Sample Data (first 3 rows):")
        print(df[REQUIRED_COLUMNS].head(3).to_string(index=False))
        
        return validation_result
        
    except Exception as e:
        return {
            'valid': False,
            'error': str(e),
            'row_count': 0
        }


def fix_csv_file(csv_path: str, output_path: str = None) -> str:
    """
    Fix common issues in CSV files and save cleaned version
    """
    if output_path is None:
        output_path = csv_path.replace('.csv', '_cleaned.csv')
    
    print(f"\n{'='*60}")
    print(f"Cleaning: {csv_path}")
    print(f"{'='*60}")
    
    # Try multiple encodings
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    df = None
    
    for encoding in encodings:
        try:
            df = pd.read_csv(csv_path, encoding=encoding)
            print(f"✅ Successfully read with encoding: {encoding}")
            break
        except Exception:
            continue
    
    if df is None:
        raise ValueError("Could not read CSV with any encoding")
    
    # Remove completely empty rows
    df = df.dropna(how='all')
    
    # Ensure required columns exist
    for col in REQUIRED_COLUMNS:
        if col not in df.columns:
            df[col] = ''
    
    # Clean string columns
    for col in ['voter_id', 'name', 'address', 'registration_date']:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
    
    # Clean age column
    if 'age' in df.columns:
        df['age'] = pd.to_numeric(df['age'], errors='coerce').fillna(0).astype(int)
        df['age'] = df['age'].clip(lower=0, upper=150)
    
    # Remove rows with empty voter_id or name
    df = df[df['voter_id'].notna() & (df['voter_id'] != '')]
    df = df[df['name'].notna() & (df['name'] != '')]
    
    # Ensure registration_date format
    if 'registration_date' in df.columns:
        df['registration_date'] = df['registration_date'].apply(
            lambda x: str(x) if pd.notna(x) and str(x) != '' else '2020-01-01'
        )
    
    # Save cleaned file
    df[REQUIRED_COLUMNS].to_csv(output_path, index=False)
    print(f"✅ Cleaned file saved to: {output_path}")
    print(f"   Original rows: {len(df) + (len(df) - len(df))}")
    print(f"   Cleaned rows: {len(df)}")
    
    return output_path


def process_demo_files(demo_folder: str):
    """
    Process all demo CSV files in a folder
    """
    demo_path = Path(demo_folder)
    
    if not demo_path.exists():
        print(f"❌ Folder not found: {demo_folder}")
        return
    
    csv_files = list(demo_path.glob('*.csv'))
    
    if not csv_files:
        print(f"❌ No CSV files found in: {demo_folder}")
        return
    
    print(f"\n{'='*60}")
    print(f"Processing {len(csv_files)} CSV files from: {demo_folder}")
    print(f"{'='*60}")
    
    results = []
    
    for csv_file in csv_files:
        print(f"\n📄 Processing: {csv_file.name}")
        result = validate_csv_file(str(csv_file))
        results.append({
            'file': csv_file.name,
            'valid': result.get('valid', False),
            'row_count': result.get('row_count', 0),
            'warnings': result.get('warnings', []),
            'error': result.get('error', None)
        })
        
        # If invalid, try to fix
        if not result.get('valid', False) and 'error' in result:
            print(f"\n🔧 Attempting to fix...")
            try:
                fixed_path = fix_csv_file(str(csv_file))
                print(f"✅ Fixed file created: {fixed_path}")
            except Exception as e:
                print(f"❌ Could not fix: {e}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    
    valid_count = sum(1 for r in results if r['valid'])
    total_rows = sum(r['row_count'] for r in results)
    
    print(f"✅ Valid files: {valid_count}/{len(results)}")
    print(f"📊 Total rows: {total_rows}")
    
    for result in results:
        status = "✅" if result['valid'] else "❌"
        print(f"{status} {result['file']}: {result['row_count']} rows")
        if result['warnings']:
            for warning in result['warnings']:
                print(f"   ⚠️  {warning}")
        if result['error']:
            print(f"   ❌ {result['error']}")


if __name__ == '__main__':
    """
    Usage:
    python scripts/process_real_data.py <csv_file_or_folder>
    """
    if len(sys.argv) < 2:
        print("Usage: python process_real_data.py <csv_file_or_folder>")
        print("\nExamples:")
        print("  python process_real_data.py data.csv")
        print("  python process_real_data.py Demo_Data/")
        sys.exit(1)
    
    input_path = sys.argv[1]
    
    if os.path.isfile(input_path):
        # Single file
        result = validate_csv_file(input_path)
        if not result.get('valid', False):
            print(f"\n❌ File is invalid. Error: {result.get('error', 'Unknown error')}")
            sys.exit(1)
    elif os.path.isdir(input_path):
        # Folder
        process_demo_files(input_path)
    else:
        print(f"❌ Path not found: {input_path}")
        sys.exit(1)
