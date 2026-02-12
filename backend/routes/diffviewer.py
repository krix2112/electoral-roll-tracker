"""DiffViewer Routes - Endpoints for comparison visualizations"""
from flask import Blueprint, jsonify, request
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll, VoterRecord
from diff_engine import compare_rolls

diffviewer_bp = Blueprint('diffviewer', __name__)

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
    
    Returns monthly aggregation of voter registrations from both uploads
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Fetch all voter records for both uploads
        old_records = VoterRecord.query.filter_by(upload_id=old_upload_id).all()
        new_records = VoterRecord.query.filter_by(upload_id=new_upload_id).all()
        
        # Group by month (YYYY-MM format)
        old_by_month = {}
        new_by_month = {}
        
        for record in old_records:
            if record.registration_date:
                month = record.registration_date[:7]  # Extract "YYYY-MM" from "YYYY-MM-DD"
                old_by_month[month] = old_by_month.get(month, 0) + 1
        
        for record in new_records:
            if record.registration_date:
                month = record.registration_date[:7]
                new_by_month[month] = new_by_month.get(month, 0) + 1
        
        # Merge all unique months and sort chronologically
        all_months = sorted(set(list(old_by_month.keys()) + list(new_by_month.keys())))
        
        # Build timeline data with real monthly counts
        timeline_data = []
        for month in all_months:
            old_count = old_by_month.get(month, 0)
            new_count = new_by_month.get(month, 0)
            timeline_data.append({
                'month': month,
                'old_count': old_count,
                'new_count': new_count,
                'net_change': new_count - old_count
            })
        
        return jsonify(timeline_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch timeline: {str(e)}'}), 500



@diffviewer_bp.route('/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Get geographic distribution of changes by constituency
    Query params: old_upload_id, new_upload_id
    
    Returns constituency-level change data for heatmap visualization
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Get real comparison data
        comparison = compare_rolls(old_upload_id, new_upload_id)
        
        # Aggregate changes BY CONSTITUENCY (real granularity)
        stats = {}
        
        # Process added voters
        for voter in comparison['added']:
            const = voter.get('constituency', 'Unknown')
            if const not in stats:
                stats[const] = {'added': 0, 'deleted': 0, 'modified': 0}
            stats[const]['added'] += 1
        
        # Process deleted voters  
        for voter in comparison['deleted']:
            const = voter.get('constituency', 'Unknown')
            if const not in stats:
                stats[const] = {'added': 0, 'deleted': 0, 'modified': 0}
            stats[const]['deleted'] += 1
        
        # Process modified voters
        for voter in comparison['modified']:
            const = voter.get('constituency', 'Unknown')
            if const not in stats:
                stats[const] = {'added': 0, 'deleted': 0, 'modified': 0}
            stats[const]['modified'] += 1
        
        # Convert to list format frontend expects
        heatmap_data = []
        for const, counts in stats.items():
            total_changes = counts['added'] + counts['deleted'] + counts['modified']
            intensity = min(100, (total_changes / 100.0) * 10)  # Scale for viz
            
            heatmap_data.append({
                'region': const,
                'added': counts['added'],
                'deleted': counts['deleted'],
                'modified': counts['modified'],
                'intensity': intensity
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
