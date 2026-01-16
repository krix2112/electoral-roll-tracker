"""Stats Route - Retrieve dashboard statistics"""
from flask import Blueprint, jsonify, request
import sys
import os
import pandas as pd
# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import ElectoralRoll

stats_bp = Blueprint('stats', __name__)

# Path to national dataset CSV (relative to backend root)
NATIONAL_CSV_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'data',
    'indian-national-level-election.csv'
)

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


@stats_bp.route('/api/dashboard', methods=['GET'])
def get_dashboard_aggregation():
    """
    Dashboard Aggregation API
    Reads national-level CSV and returns aggregated statistics.
    Does NOT expose individual voter records.
    """
    try:
        # Get optional state filter (case-insensitive)
        state_filter = request.args.get('state', '').strip()

        # ---------------------------------------------------------
        # PRIORITY 1: USER UPLOADS (Dynamic Data)
        # ---------------------------------------------------------
        # Check if we have any uploads in the database
        user_uploads_query = ElectoralRoll.query
        if state_filter and state_filter.upper() not in ['ALL', '']:
             user_uploads_query = user_uploads_query.filter(ElectoralRoll.state == state_filter)
        
        user_uploads = user_uploads_query.all()
        
        # If user has uploaded data, use THAT instead of static CSV
        # Exception: If specific state filter yields 0 results but we have uploads elsewhere, 
        # we might want to show 0? Or fallback? 
        # Logic: If GLOBAL uploads exist > 0, we serve Dynamic Mode.
        global_upload_count = ElectoralRoll.query.count()
        
        if global_upload_count > 0:
            # Aggregate from DB
            total_voters = sum(u.row_count for u in user_uploads)
            states = set(u.state for u in user_uploads if u.state)
            states_count = len(states)
            
            # Treat each upload as a "Constituency" or "Roll Segment"
            constituencies_count = len(user_uploads)
            
            # Sort by size to mimic "Top Constituencies"
            sorted_uploads = sorted(user_uploads, key=lambda x: x.row_count, reverse=True)
            top_constituencies = [
                {
                    'constituency': u.filename, 
                    'voter_count': u.row_count,
                    'state': u.state or 'Unknown'
                }
                for u in sorted_uploads[:100]
            ]
            
            return jsonify({
                'total_voters': total_voters,
                'states_count': states_count,
                'constituencies_count': constituencies_count,
                'top_constituencies': top_constituencies,
                'filter_applied': state_filter if state_filter else 'ALL',
                'data_source': 'user_uploads'
            }), 200

        # ---------------------------------------------------------
        # PRIORITY 2: STATIC CSV (Demo Data)
        # ---------------------------------------------------------
        # Load CSV safely
        if not os.path.exists(NATIONAL_CSV_PATH):
            return jsonify({'error': 'National dataset file not found'}), 404
        
        try:
            # Try reading with common encodings
            df = None
            for encoding in ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']:
                try:
                    df = pd.read_csv(NATIONAL_CSV_PATH, encoding=encoding, low_memory=False)
                    break
                except (UnicodeDecodeError, pd.errors.ParserError):
                    continue
            
            if df is None:
                return jsonify({'error': 'Unable to parse CSV file. Check file encoding and format'}), 400
            
            # Check for required columns (case-insensitive)
            df.columns = df.columns.str.strip().str.lower()
            
            # Find state and constituency columns (case-insensitive)
            state_col = None
            constituency_col = None
            
            for col in df.columns:
                if 'state' in col or 'st_name' in col:
                    state_col = col
                if 'constituency' in col or 'pc_name' in col or 'constituency' in col:
                    constituency_col = col
            
            if state_col is None:
                return jsonify({'error': 'State column not found in CSV. Expected column containing "state" or "st_name"'}), 400
            
            if constituency_col is None:
                return jsonify({'error': 'Constituency column not found in CSV. Expected column containing "constituency" or "pc_name"'}), 400
            
            # Apply state filter if provided
            if state_filter and state_filter.upper() not in ['ALL', '']:
                # Case-insensitive state matching
                df = df[df[state_col].astype(str).str.strip().str.upper() == state_filter.upper()]
            
            # Calculate aggregations
            total_voters = len(df)
            
            # Count unique states (after filter)
            states_count = df[state_col].astype(str).str.strip().nunique()
            
            # Count unique constituencies
            constituencies_count = df[constituency_col].astype(str).str.strip().nunique()
            
            # Top 100 constituencies by voter count (row count per constituency)
            # Group by state AND constituency to preserve state info
            constituency_counts = df.groupby([state_col, constituency_col]).size().reset_index(name='voter_count')
            constituency_counts = constituency_counts.sort_values('voter_count', ascending=False).head(100)
            
            top_constituencies = [
                {
                    'constituency': str(row[constituency_col]).strip(),
                    'voter_count': int(row['voter_count']),
                    'state': str(row[state_col]).strip()
                }
                for _, row in constituency_counts.iterrows()
            ]
            
            return jsonify({
                'total_voters': int(total_voters),
                'states_count': int(states_count),
                'constituencies_count': int(constituencies_count),
                'top_constituencies': top_constituencies,
                'filter_applied': state_filter if state_filter else 'ALL'
            }), 200
            
        except pd.errors.EmptyDataError:
            return jsonify({'error': 'CSV file is empty'}), 400
        except pd.errors.ParserError as e:
            return jsonify({'error': f'CSV parsing error: {str(e)}'}), 400
        except KeyError as e:
            return jsonify({'error': f'Required column not found: {str(e)}'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Failed to process dashboard data: {str(e)}'}), 500
