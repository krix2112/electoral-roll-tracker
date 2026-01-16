"""
Electoral Roll Tracker - Main Application
Team: Teen Titans | Snowfrost Hackathon 2026
"""

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

from database import init_db, db
from routes.upload import upload_bp
from routes.compare import compare_bp
from routes.uploads import uploads_bp
from routes.stats import stats_bp
from routes.notifications import notifications_bp
from routes.diffviewer import diffviewer_bp
from routes.investigation import investigation_bp
from routes.forensic import forensic_bp

load_dotenv()

app = Flask(__name__)

# Configuration
# Use SQLite for local development if DATABASE_URL is not set
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///electoral_roll_db.sqlite')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_UPLOAD_SIZE', 52428800))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# CORS Configuration
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize database
init_db(app)

# Register blueprints
app.register_blueprint(upload_bp)
app.register_blueprint(compare_bp)
app.register_blueprint(uploads_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(diffviewer_bp)
app.register_blueprint(investigation_bp)
app.register_blueprint(forensic_bp)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Electoral Roll Tracker API',
        'version': '1.0.0'
    }), 200

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'message': 'Electoral Roll Tracker API',
        'team': 'Teen Titans',
        'hackathon': 'Snowfrost 2026',
        'endpoints': {
            'upload': '/api/upload',
            'compare': '/api/compare',
            'uploads': '/api/uploads',
            'stats': '/api/stats',
            'dashboard': '/api/dashboard',
            'top-anomaly': '/api/top-anomaly',
            'anomaly-summary': '/api/anomaly-summary',
            'health': '/health'
        }
    }), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 50MB'}), 413

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"Electoral Roll Tracker API starting on {host}:{port}")
    print(f"Environment: {os.getenv('FLASK_ENV', 'development')}")
    
    app.run(host=host, port=port, debug=os.getenv('FLASK_DEBUG', 'True') == 'True')
