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
        try:
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            # If tables already exist, that's okay
            if "already exists" not in str(e).lower():
                print(f"Database initialization warning: {e}")
            else:
                print("Database tables already exist, skipping creation")
