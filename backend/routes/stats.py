"""Stats Route - Retrieve dashboard statistics"""
from flask import Blueprint, jsonify, request
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('/api/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        state_filter = request.args.get('state', 'All States')
        
        # Get total number of uploads (audits)
        total_audits = ElectoralRoll.query.count()
        
        # Get the latest roll to estimate current voter count
        if state_filter != 'All States':
            # Filter by state
            latest_roll_query = ElectoralRoll.query.filter_by(state=state_filter).order_by(ElectoralRoll.uploaded_at.desc())
            latest_roll = latest_roll_query.first()
            total_audits = ElectoralRoll.query.filter_by(state=state_filter).count()
        else:
            # All states
            latest_roll = ElectoralRoll.query.order_by(ElectoralRoll.uploaded_at.desc()).first()
        
        current_voters = 0
        if latest_roll:
            current_voters = latest_roll.row_count

        # Format voters count (e.g., 6.2M or 15.4K or just raw number)
        voters_display = str(current_voters)
        if current_voters > 1000000:
            voters_display = f"{current_voters / 1000000:.1f}M"
        elif current_voters > 1000:
            voters_display = f"{current_voters / 1000:.1f}K"
            
        return jsonify({
            'voters': {'value': voters_display, 'raw': current_voters, 'change': '+0.0%', 'trend': 'neutral'},
            'anomalies': {'value': str(int(current_voters * 0.001)), 'type': 'critical'}, # Still mock anomaly rate until we have real anomalies table
            'audits': {'value': str(total_audits), 'type': 'info'},
            'filter_applied': state_filter
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500
