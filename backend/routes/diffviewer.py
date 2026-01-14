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
    Get time-series data for changes
    Query params: old_upload_id, new_upload_id
    
    Note: This is currently mock data for visualization purposes.
    Real time-series would require historical comparison data.
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Get comparison to derive timeline
        result = compare_rolls(old_upload_id, new_upload_id)
        stats = result.get('stats', {})
        
        # Generate mock timeline data based on comparison stats
        # In a real system, this would come from historical comparison records
        total_changes = stats.get('total_added', 0) + stats.get('total_deleted', 0) + stats.get('total_modified', 0)
        
        timeline = []
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        for i, month in enumerate(months):
            # Distribute changes across timeline
            progress = (i + 1) / len(months)
            timeline.append({
                'month': month,
                'added': int(stats.get('total_added', 0) * progress * 0.1),
                'deleted': int(stats.get('total_deleted', 0) * progress * 0.1),
                'modified': int(stats.get('total_modified', 0) * progress * 0.1)
            })
        
        return jsonify(timeline), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch timeline: {str(e)}'}), 500


@diffviewer_bp.route('/heatmap', methods=['GET'])
def get_heatmap_data():
    """
    Get geographic distribution of changes
    Query params: old_upload_id, new_upload_id
    
    Returns constituency-level change data for heatmap visualization
    """
    try:
        old_upload_id = request.args.get('old_upload_id')
        new_upload_id = request.args.get('new_upload_id')
        
        if not old_upload_id or not new_upload_id:
            return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
        
        # Get comparison result
        result = compare_rolls(old_upload_id, new_upload_id)
        
        # Get state information from uploads
        old_roll = ElectoralRoll.query.filter_by(upload_id=old_upload_id).first()
        new_roll = ElectoralRoll.query.filter_by(upload_id=new_upload_id).first()
        
        if not old_roll or not new_roll:
            return jsonify({'error': 'Upload not found'}), 404
        
        stats = result.get('stats', {})
        
        # Create heatmap data structure
        # In a real system, this would aggregate by constituency/region
        heatmap_data = [{
            'region': old_roll.state or 'Unknown',
            'added': stats.get('total_added', 0),
            'deleted': stats.get('total_deleted', 0),
            'modified': stats.get('total_modified', 0),
            'intensity': min(100, (stats.get('total_added', 0) + stats.get('total_deleted', 0)) / 10)
        }]
        
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
