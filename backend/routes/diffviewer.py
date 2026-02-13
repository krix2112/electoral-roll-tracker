"""DiffViewer Routes - Endpoints for comparison visualizations"""
from flask import Blueprint, jsonify, request
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll, VoterRecord
from diff_engine import compare_rolls

diffviewer_bp = Blueprint('diffviewer', __name__, url_prefix='/api/diffviewer')

@diffviewer_bp.route('/stats', methods=['GET'])
def get_comparison_stats():
    """
    Get summary statistics from comparison
    Query params: old_upload_id, new_upload_id
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Perform comparison using existing engine
        result = compare_rolls(old_upload_id, new_upload_id)
        
        # Extract stats from comparison result
        stats = result.get('stats', {})
        
        return jsonify({
            'total_added': stats.get('total_added', 0),
            'total_deleted': stats.get('total_deleted', 0),
            'total_modified': stats.get('total_modified', 0),
            'total_unchanged': stats.get('total_unchanged', 0),
            'anomaly_score': stats.get('anomaly_score', 0),
            'risk_level': stats.get('risk_level', 'low')
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500


@diffviewer_bp.route('/timeline', methods=['GET'])
def get_timeline_data():
    """
    Get time-series data based on voter registration dates
    Query params: old_upload_id, new_upload_id
    """
    from database import db
    from sqlalchemy import text
    import pandas as pd
    
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Load only registration date to minimize memory
        query = text("SELECT registration_date FROM voter_records WHERE upload_id = :uid")
        
        old_df = pd.read_sql(query, db.engine, params={"uid": old_upload_id})
        new_df = pd.read_sql(query, db.engine, params={"uid": new_upload_id})
        
        # Aggregate by month (YYYY-MM)
        # Using .str[:7] is fast for string dates
        old_counts = old_df['registration_date'].str[:7].value_counts().sort_index()
        new_counts = new_df['registration_date'].str[:7].value_counts().sort_index()
        
        # Combine into one timeline
        all_months = sorted(set(old_counts.index) | set(new_counts.index))
        
        timeline_data = []
        for month in all_months:
            oc = int(old_counts.get(month, 0))
            nc = int(new_counts.get(month, 0))
            timeline_data.append({
                'month': month,
                'old_count': oc,
                'new_count': nc,
                'net_change': nc - oc
            })
        
        return jsonify(timeline_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch timeline: {str(e)}'}), 500



@diffviewer_bp.route('/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Get geographic distribution of changes by constituency using pandas
    """
    from database import db
    from sqlalchemy import text
    import pandas as pd
    
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Perform comparison with NO LIMIT on detailed records
        # because the heatmap needs the full count per constituency
        result = compare_rolls(old_upload_id, new_upload_id, limit=0)
        
        # We handle aggregation on the backend to keep the payload small
        # even if there are 100k changes.
        
        # Since compare_rolls(limit=0) returns empty added/deleted/modified lists,
        # but the stats are accurate, we actually need to refactor compare_rolls 
        # or calculate heatmap distribution HERE for efficiency.
        
        # Optimization: Just query counts by constituency directly for added/deleted
        # Modified still needs the row_hash comparison.
        
        query = text("SELECT voter_id, constituency, row_hash FROM voter_records WHERE upload_id = :uid")
        old_df = pd.read_sql(query, db.engine, params={"uid": old_upload_id})
        new_df = pd.read_sql(query, db.engine, params={"uid": new_upload_id})
        
        # 1. Added by constituency
        added_df = new_df[~new_df['voter_id'].isin(old_df['voter_id'])]
        added_counts = added_df.groupby('constituency').size()
        
        # 2. Deleted by constituency
        deleted_df = old_df[~old_df['voter_id'].isin(new_df['voter_id'])]
        deleted_counts = deleted_df.groupby('constituency').size()
        
        # 3. Modified by constituency
        common_ids = set(old_df['voter_id']) & set(new_df['voter_id'])
        old_common = old_df[old_df['voter_id'].isin(common_ids)].set_index('voter_id')
        new_common = new_df[new_df['voter_id'].isin(common_ids)].set_index('voter_id')
        modified_ids = old_common[old_common['row_hash'] != new_common['row_hash']].index
        modified_counts = new_common.loc[modified_ids].groupby('constituency').size()
        
        # Combine all constituencies
        all_regions = sorted(set(added_counts.index) | set(deleted_counts.index) | set(modified_counts.index))
        
        heatmap_data = []
        for region in all_regions:
            ac = int(added_counts.get(region, 0))
            dc = int(deleted_counts.get(region, 0))
            mc = int(modified_counts.get(region, 0))
            total = ac + dc + mc
            
            heatmap_data.append({
                'region': region,
                'added': ac,
                'deleted': dc,
                'modified': mc,
                'intensity': min(100, (total / 100.0) * 10)
            })
            
        return jsonify(heatmap_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch heatmap: {str(e)}'}), 500



@diffviewer_bp.route('/differences', methods=['GET'])
def get_differences():
    """
    Get detailed list of voter-level differences with pagination
    Query params: old_upload_id, new_upload_id, page (default 1), limit (default 50)
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        if page < 1:
            page = 1
        if limit < 1 or limit > 100:
            limit = 50
        
        # Get comparison result
        result = compare_rolls(old_upload_id, new_upload_id)
        
        # Combine all differences
        all_differences = []
        
        # Added voters
        for voter in result.get('added', []):
            all_differences.append({
                'type': 'added',
                'voter_id': voter.get('voter_id'),
                'name': voter.get('name'),
                'age': voter.get('age'),
                'address': voter.get('address'),
                'registration_date': voter.get('registration_date')
            })
        
        # Deleted voters
        for voter in result.get('deleted', []):
            all_differences.append({
                'type': 'deleted',
                'voter_id': voter.get('voter_id'),
                'name': voter.get('name'),
                'age': voter.get('age'),
                'address': voter.get('address'),
                'registration_date': voter.get('registration_date')
            })
        
        # Modified voters
        for change in result.get('modified', []):
            all_differences.append({
                'type': 'modified',
                'voter_id': change.get('voter_id'),
                'old_data': change.get('old'),
                'new_data': change.get('new'),
                'changes': change.get('changes', [])
            })
        
        # Pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_differences = all_differences[start_idx:end_idx]
        
        return jsonify({
            'differences': paginated_differences,
            'total': len(all_differences),
            'page': page,
            'limit': limit,
            'total_pages': (len(all_differences) + limit - 1) // limit
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch differences: {str(e)}'}), 500
