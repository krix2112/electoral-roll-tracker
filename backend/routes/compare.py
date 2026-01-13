"""Compare Route - Compare two electoral rolls"""
from flask import Blueprint, request, jsonify
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll
from diff_engine import compare_rolls
from utils.pattern_detector import detect_suspicious_patterns

compare_bp = Blueprint('compare', __name__)

@compare_bp.route('/api/compare', methods=['POST'])
def compare_electoral_rolls():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Request body is required'}), 400
    
    old_id = data.get('old_upload_id')
    new_id = data.get('new_upload_id')
    
    if not old_id or not new_id:
        return jsonify({'error': 'Both old_upload_id and new_upload_id are required'}), 400
    
    if old_id == new_id:
        return jsonify({'error': 'Cannot compare an electoral roll with itself'}), 400
    
    try:
        old_roll = ElectoralRoll.query.filter_by(upload_id=old_id).first()
        new_roll = ElectoralRoll.query.filter_by(upload_id=new_id).first()
        
        if not old_roll:
            return jsonify({'error': f'Electoral roll not found: {old_id}'}), 404
        
        if not new_roll:
            return jsonify({'error': f'Electoral roll not found: {new_id}'}), 404
        
        result = compare_rolls(old_id, new_id)
        alerts = detect_suspicious_patterns(result)
        result['alerts'] = alerts
        
        result['metadata'] = {
            'old_roll': {
                'upload_id': old_roll.upload_id,
                'filename': old_roll.filename,
                'row_count': old_roll.row_count,
                'uploaded_at': old_roll.uploaded_at.isoformat()
            },
            'new_roll': {
                'upload_id': new_roll.upload_id,
                'filename': new_roll.filename,
                'row_count': new_roll.row_count,
                'uploaded_at': new_roll.uploaded_at.isoformat()
            }
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'Comparison failed: {str(e)}'}), 500
