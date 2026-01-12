"""Uploads Route - Retrieve list of uploaded electoral rolls"""
from flask import Blueprint, jsonify
import sys
import os
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll

uploads_bp = Blueprint('uploads', __name__)

@uploads_bp.route('/api/uploads', methods=['GET'])
def get_uploads():
    try:
        uploads = ElectoralRoll.query.order_by(ElectoralRoll.uploaded_at.desc()).all()
        result = [upload.to_dict() for upload in uploads]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f'Failed to fetch uploads: {str(e)}'}), 500
