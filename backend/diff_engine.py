"""
Diff Engine - Core algorithm for comparing electoral rolls
Owner: Vansh (Backend Developer)
"""

import pandas as pd
import hashlib
from models import VoterRecord

def compare_rolls(old_upload_id, new_upload_id, limit=500):
    """Compare two electoral rolls and return differences using efficient pandas operations"""
    from database import db
    from sqlalchemy import text
    import pandas as pd
    
    # Load data directly into DataFrames using SQL for speed
    # This avoids instantiating thousands of SQLAlchemy objects
    query = text("SELECT voter_id, name, age, address, constituency, registration_date, row_hash FROM voter_records WHERE upload_id = :uid")
    
    old_df = pd.read_sql(query, db.engine, params={"uid": old_upload_id})
    new_df = pd.read_sql(query, db.engine, params={"uid": new_upload_id})
    
    if old_df.empty and new_df.empty:
        return {
            'added': [], 'deleted': [], 'modified': [],
            'stats': {'total_added': 0, 'total_deleted': 0, 'total_modified': 0, 'old_count': 0, 'new_count': 0}
        }
    
    # 1. ADDED & DELETED (Vectorized)
    added_voters_mask = ~new_df['voter_id'].isin(old_df['voter_id'])
    added_df = new_df[added_voters_mask]
    
    deleted_voters_mask = ~old_df['voter_id'].isin(new_df['voter_id'])
    deleted_df = old_df[deleted_voters_mask]
    
    # 2. MODIFIED (Vectorized identification)
    common_ids = set(old_df['voter_id']) & set(new_df['voter_id'])
    
    old_common = old_df[old_df['voter_id'].isin(common_ids)].set_index('voter_id')
    new_common = new_df[new_df['voter_id'].isin(common_ids)].set_index('voter_id')
    
    # Find where row_hash differs
    modified_mask = old_common['row_hash'] != new_common['row_hash']
    modified_old = old_common[modified_mask]
    modified_new = new_common[modified_mask]
    
    total_modified = len(modified_old)
    
    # 3. LIMIT DETAILED RECORDS FOR NETWORK PERFORMANCE
    # We return the top N modifications for display, but counts remain accurate.
    modified_records = []
    ids_to_process = modified_old.index[:limit] if limit > 0 else modified_old.index
    
    for voter_id in ids_to_process:
        old_row = modified_old.loc[voter_id]
        new_row = modified_new.loc[voter_id]
        
        changes = {}
        for col in ['name', 'age', 'address', 'constituency', 'registration_date']:
            if str(old_row[col]) != str(new_row[col]):
                changes[col] = {'old': old_row[col], 'new': new_row[col]}
                
        modified_records.append({
            'voter_id': voter_id,
            'old': old_row.drop('row_hash').to_dict(),
            'new': new_row.drop('row_hash').to_dict(),
            'changes': changes
        })
    
    # Apply limit to added/deleted as well for UI sanity
    added_list = added_df.drop(columns=['row_hash']).head(limit if limit > 0 else len(added_df)).to_dict('records')
    deleted_list = deleted_df.drop(columns=['row_hash']).head(limit if limit > 0 else len(deleted_df)).to_dict('records')
    
    return {
        'added': added_list,
        'deleted': deleted_list,
        'modified': modified_records,
        'stats': {
            'total_added': len(added_df),
            'total_deleted': len(deleted_df),
            'total_modified': total_modified,
            'old_count': len(old_df),
            'new_count': len(new_df),
            'unchanged': len(common_ids) - total_modified,
            'limited_view': limit > 0 and (len(added_df) > limit or len(deleted_df) > limit or total_modified > limit)
        }
    }



def calculate_row_hash(row_data):
    """Calculate MD5 hash for a row of voter data"""
    row_string = f"{row_data['voter_id']}|{row_data['name']}|{row_data['age']}|{row_data['address']}|{row_data['registration_date']}|{row_data.get('constituency', 'Unknown')}"
    return hashlib.md5(row_string.encode('utf-8')).hexdigest()


def calculate_dataset_hash(df):
    """Calculate hash for entire dataset"""
    df_sorted = df.sort_values('voter_id').reset_index(drop=True)
    dataset_string = df_sorted.to_csv(index=False)
    return hashlib.md5(dataset_string.encode('utf-8')).hexdigest()
