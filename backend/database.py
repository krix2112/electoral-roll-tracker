"""
Database configuration and initialization
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    
    with app.app_context():
        from models import ElectoralRoll, VoterRecord
        db.create_all()
        print("✅ Database tables created successfully")
