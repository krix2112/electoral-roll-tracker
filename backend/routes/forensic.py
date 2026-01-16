"""
RollDiff Forensic Analysis API Routes
Advanced multi-layer anomaly detection endpoints
"""

from flask import Blueprint, request, jsonify
from database import db
from models import ElectoralRoll, VoterRecord
from forensics.fusion import MultiSignalFusionEngine
from datetime import datetime
import json

forensic_bp = Blueprint('forensic', __name__, url_prefix='/api')

# Initialize the fusion engine
fusion_engine = MultiSignalFusionEngine()

# In-memory cache for analysis results (in production, use Redis or database)
analysis_cache = {}


@forensic_bp.route('/analyze', methods=['POST'])
def analyze_constituency():
    """
    Main forensic analysis endpoint
    Accepts two voter snapshots (current vs. previous) and runs all detection modules
    
    Request Body:
    {
        "current_upload_id": "uuid",
        "previous_upload_id": "uuid",  // optional
        "constituency": "AC-103"  // optional filter
    }
    
    Returns:
    {
        "analysis_id": "unique-id",
        "final_anomaly_score": 75.5,
        "verdict": "Critical Anomaly",
        "confidence_level": "High",
        "module_breakdowns": [...],
        "all_evidence": [...],
        "summary": "..."
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'current_upload_id' not in data:
            return jsonify({'error': 'current_upload_id is required'}), 400
        
        current_upload_id = data['current_upload_id']
        previous_upload_id = data.get('previous_upload_id')
        constituency_filter = data.get('constituency')
        
        # Fetch current voters
        current_roll = ElectoralRoll.query.filter_by(upload_id=current_upload_id).first()
        if not current_roll:
            return jsonify({'error': 'Current upload not found'}), 404
        
        current_query = VoterRecord.query.filter_by(upload_id=current_upload_id)
        if constituency_filter:
            current_query = current_query.filter_by(constituency=constituency_filter)
        
        current_voters = [v.to_dict() for v in current_query.all()]
        
        # Fetch previous voters (if provided)
        previous_voters = []
        if previous_upload_id:
            previous_query = VoterRecord.query.filter_by(upload_id=previous_upload_id)
            if constituency_filter:
                previous_query = previous_query.filter_by(constituency=constituency_filter)
            previous_voters = [v.to_dict() for v in previous_query.all()]
        
        # Run forensic analysis
        analysis_result = fusion_engine.analyze(current_voters, previous_voters)
        
        # Generate analysis ID
        analysis_id = f"analysis_{current_upload_id}_{int(datetime.utcnow().timestamp())}"
        
        # Cache the result
        analysis_cache[analysis_id] = {
            **analysis_result,
            'analysis_id': analysis_id,
            'current_upload_id': current_upload_id,
            'previous_upload_id': previous_upload_id,
            'constituency': constituency_filter,
            'state': current_roll.state,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'analysis_id': analysis_id,
            **analysis_result
        }), 200
        
    except Exception as e:
        print(f"Analysis error: {str(e)}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@forensic_bp.route('/top-anomaly', methods=['GET'])
def get_top_anomaly_forensic():
    """
    Enhanced top anomaly endpoint
    Scans all cached analyses and returns the one with highest final_anomaly_score
    
    Returns:
    {
        "analysis_id": "...",
        "final_anomaly_score": 85.3,
        "constituency": "AC-103",
        "state": "Maharashtra",
        "verdict": "Critical Anomaly",
        "triggered_modules": ["Network Analysis", "Entropy Analysis"],
        "top_evidence": [...]
    }
    """
    try:
        if not analysis_cache:
            # If no cached analyses, run a demo analysis
            return _generate_demo_top_anomaly()
        
        # Find analysis with highest score
        top_analysis = max(analysis_cache.values(), key=lambda x: x.get('final_anomaly_score', 0))
        
        # Identify which modules triggered (score > 50)
        triggered_modules = [
            module['module'] 
            for module in top_analysis.get('module_breakdowns', [])
            if module['score'] > 50
        ]
        
        # Get top 3 evidence items
        top_evidence = top_analysis.get('all_evidence', [])[:3]
        
        return jsonify({
            'analysis_id': top_analysis.get('analysis_id'),
            'final_anomaly_score': top_analysis.get('final_anomaly_score'),
            'constituency': top_analysis.get('constituency', 'Unknown'),
            'state': top_analysis.get('state', 'Unknown'),
            'verdict': top_analysis.get('verdict'),
            'confidence_level': top_analysis.get('confidence_level'),
            'triggered_modules': triggered_modules,
            'top_evidence': top_evidence,
            'module_breakdowns': top_analysis.get('module_breakdowns', []),
            'timestamp': top_analysis.get('timestamp')
        }), 200
        
    except Exception as e:
        print(f"Top anomaly error: {str(e)}")
        return jsonify({'error': f'Failed to fetch top anomaly: {str(e)}'}), 500


@forensic_bp.route('/analysis/<analysis_id>', methods=['GET'])
def get_analysis_details(analysis_id):
    """
    Fetch detailed results of a specific analysis
    
    Returns:
    Complete analysis object with all module breakdowns
    """
    try:
        if analysis_id not in analysis_cache:
            return jsonify({'error': 'Analysis not found'}), 404
        
        analysis = analysis_cache[analysis_id]
        return jsonify(analysis), 200
        
    except Exception as e:
        print(f"Analysis fetch error: {str(e)}")
        return jsonify({'error': f'Failed to fetch analysis: {str(e)}'}), 500


@forensic_bp.route('/analyses', methods=['GET'])
def list_analyses():
    """
    List all cached analyses
    
    Query params:
    - min_score: Filter by minimum anomaly score
    - state: Filter by state
    """
    try:
        min_score = request.args.get('min_score', type=float, default=0)
        state_filter = request.args.get('state')
        
        analyses = list(analysis_cache.values())
        
        # Apply filters
        if min_score > 0:
            analyses = [a for a in analyses if a.get('final_anomaly_score', 0) >= min_score]
        
        if state_filter:
            analyses = [a for a in analyses if a.get('state') == state_filter]
        
        # Sort by score (descending)
        analyses.sort(key=lambda x: x.get('final_anomaly_score', 0), reverse=True)
        
        # Return summary view
        summary = [{
            'analysis_id': a['analysis_id'],
            'final_anomaly_score': a['final_anomaly_score'],
            'verdict': a['verdict'],
            'constituency': a.get('constituency', 'All'),
            'state': a.get('state'),
            'timestamp': a['timestamp']
        } for a in analyses]
        
        return jsonify({
            'total': len(summary),
            'analyses': summary
        }), 200
        
    except Exception as e:
        print(f"List analyses error: {str(e)}")
        return jsonify({'error': f'Failed to list analyses: {str(e)}'}), 500


def _generate_demo_top_anomaly():
    """Generate a demo top anomaly for initial showcase"""
    return jsonify({
        'analysis_id': 'demo_analysis_001',
        'final_anomaly_score': 87.5,
        'constituency': 'AC-103',
        'state': 'Maharashtra',
        'verdict': 'Critical Anomaly',
        'confidence_level': 'High',
        'triggered_modules': ['Network Analysis', 'Entropy Analysis', 'Behavioral Fingerprinting'],
        'top_evidence': [
            "🏝️ **Network Isolation Alert**: 2847 voters show zero familial or residential connections to existing rolls",
            "📅 **Bulk Registration Alert**: 3200 voters registered on 2024-01-15 (entropy: 0.23)",
            "⚠️ **Age-Migration Mismatch**: 3 age groups show abnormal movement patterns"
        ],
        'module_breakdowns': [
            {
                'module': 'Network Analysis',
                'score': 92.3,
                'weight': 0.35,
                'contribution': 32.3,
                'evidence': ["🏝️ **Network Isolation Alert**: 2847 voters show zero connections"]
            },
            {
                'module': 'Entropy Analysis',
                'score': 85.7,
                'weight': 0.25,
                'contribution': 21.4,
                'evidence': ["📅 **Bulk Registration Alert**: 3200 voters on same date"]
            },
            {
                'module': 'Behavioral Fingerprinting',
                'score': 78.2,
                'weight': 0.25,
                'contribution': 19.6,
                'evidence': ["⚠️ **Age-Migration Mismatch**: Abnormal patterns detected"]
            }
        ],
        'timestamp': datetime.utcnow().isoformat()
    }), 200
