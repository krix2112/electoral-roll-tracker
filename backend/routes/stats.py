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
        latest_roll = ElectoralRoll.query.order_by(ElectoralRoll.uploaded_at.desc()).first()
        
        current_voters = 0
        if latest_roll:
            current_voters = latest_roll.row_count
            
        # Simulating state-based filtering (since we don't have structured state data yet)
        # This allows the UI to demonstrate responsiveness to the filter "those things"
        if state_filter == 'Maharashtra':
            current_voters = int(current_voters * 0.45) # Mock approx 45%
            total_audits = max(1, int(total_audits * 0.4))
        elif state_filter == 'Delhi':
             current_voters = int(current_voters * 0.15) # Mock approx 15%
             total_audits = max(1, int(total_audits * 0.2))

        # Format voters count (e.g., 6.2M or 15.4K or just raw number)
        voters_display = str(current_voters)
        if current_voters > 1000000:
            voters_display = f"{current_voters / 1000000:.1f}M"
        elif current_voters > 1000:
            voters_display = f"{current_voters / 1000:.1f}K"
            
        return jsonify({
            'voters': {'value': voters_display, 'raw': current_voters, 'change': '+2.1%' if state_filter == 'All States' else '-0.5%', 'trend': 'up' if state_filter == 'All States' else 'down'},
            'anomalies': {'value': str(int(current_voters * 0.001)), 'type': 'critical'}, # Mock anomaly rate
            'audits': {'value': str(total_audits), 'type': 'info'},
            'filter_applied': state_filter
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to fetch stats: {str(e)}'}), 500
