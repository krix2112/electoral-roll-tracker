from flask import Blueprint, request, jsonify
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import db
from models import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Fetch all notifications ordered by timestamp desc"""
    try:
        notifications = Notification.query.order_by(Notification.timestamp.desc()).limit(50).all()
        return jsonify([n.to_dict() for n in notifications]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/api/notifications/<int:id>/read', methods=['PATCH'])
def mark_read(id):
    """Mark a notification as read"""
    try:
        notification = Notification.query.get(id)
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification.is_read = True
        db.session.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/api/notifications', methods=['POST'])
def create_notification():
    """Internal/Admin endpoint to create notifications"""
    try:
        data = request.json
        new_notification = Notification(
            title=data.get('title'),
            message=data.get('message'),
            severity=data.get('severity', 'info'),
            related_entity=data.get('related_entity'),
            action_url=data.get('action_url'),
            action_type=data.get('action_type')
        )
        db.session.add(new_notification)
        db.session.commit()
        return jsonify(new_notification.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
