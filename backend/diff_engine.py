"""
Diff Engine - Core algorithm for comparing electoral rolls
Owner: Vansh (Backend Developer)
"""

import pandas as pd
import hashlib
from models import VoterRecord

def compare_rolls(old_upload_id, new_upload_id):
    """Compare two electoral rolls and return differences"""
    
    old_records = VoterRecord.query.filter_by(upload_id=old_upload_id).all()
    new_records = VoterRecord.query.filter_by(upload_id=new_upload_id).all()
    
    old_df = pd.DataFrame([{
        'voter_id': r.voter_id,
        'name': r.name,
        'age': r.age,
        'address': r.address,
        'constituency': r.constituency,
        'registration_date': r.registration_date,
        'row_hash': r.row_hash
    } for r in old_records])
    
    new_df = pd.DataFrame([{
        'voter_id': r.voter_id,
        'name': r.name,
        'age': r.age,
        'address': r.address,
        'constituency': r.constituency,
        'registration_date': r.registration_date,
        'row_hash': r.row_hash
    } for r in new_records])
    
    if old_df.empty and new_df.empty:
        return {
            'added': [], 'deleted': [], 'modified': [],
            'stats': {'total_added': 0, 'total_deleted': 0, 'total_modified': 0, 'old_count': 0, 'new_count': 0}
        }
    
    if old_df.empty:
        return {
            'added': new_df.drop(columns=['row_hash']).to_dict('records'),
            'deleted': [], 'modified': [],
            'stats': {'total_added': len(new_df), 'total_deleted': 0, 'total_modified': 0, 'old_count': 0, 'new_count': len(new_df)}
        }
    
    if new_df.empty:
        return {
            'added': [],
            'deleted': old_df.drop(columns=['row_hash']).to_dict('records'),
            'modified': [],
            'stats': {'total_added': 0, 'total_deleted': len(old_df), 'total_modified': 0, 'old_count': len(old_df), 'new_count': 0}
        }
    
    old_hashes = set(old_df['row_hash'])
    new_hashes = set(new_df['row_hash'])
    
    deleted_hashes = old_hashes - new_hashes
    added_hashes = new_hashes - old_hashes
    
    deleted_records = old_df[old_df['row_hash'].isin(deleted_hashes)].drop(columns=['row_hash']).to_dict('records')
    added_records = new_df[new_df['row_hash'].isin(added_hashes)].drop(columns=['row_hash']).to_dict('records')
    
    old_voter_ids = set(old_df['voter_id'])
    new_voter_ids = set(new_df['voter_id'])
    common_voter_ids = old_voter_ids & new_voter_ids
    
    modified_records = []
    old_dict = {row['voter_id']: row for row in old_df.to_dict('records')}
    new_dict = {row['voter_id']: row for row in new_df.to_dict('records')}
    
    for voter_id in common_voter_ids:
        old_row = old_dict[voter_id]
        new_row = new_dict[voter_id]
        
        if old_row['row_hash'] != new_row['row_hash']:
            old_data = {k: v for k, v in old_row.items() if k != 'row_hash'}
            new_data = {k: v for k, v in new_row.items() if k != 'row_hash'}
            
            changes = {}
            for key in old_data.keys():
                if old_data[key] != new_data[key]:
                    changes[key] = {'old': old_data[key], 'new': new_data[key]}
            
            modified_records.append({
                'voter_id': voter_id,
                'old': old_data,
                'new': new_data,
                'changes': changes
            })
    
    return {
        'added': added_records,
        'deleted': deleted_records,
        'modified': modified_records,
        'stats': {
            'total_added': len(added_records),
            'total_deleted': len(deleted_records),
            'total_modified': len(modified_records),
            'old_count': len(old_df),
            'new_count': len(new_df),
            'unchanged': len(common_voter_ids) - len(modified_records)
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
