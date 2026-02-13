import sys
import os
import sqlite3
import pandas as pd

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database import db
from models import ElectoralRoll, VoterRecord
from app import app



def inspect_db_raw():
    # Correct path: one level up from scripts, then into instance
    db_path = os.path.join(os.path.dirname(__file__), '..', 'instance', 'electoral_roll_db.sqlite')
    print(f"--- Inspecting Raw DB File: {db_path} ---")
    
    if not os.path.exists(db_path):
        print("❌ DATABASE FILE NOT FOUND!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    

    try:
        # Check Tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {[t[0] for t in tables]}")
        
        # Check Electoral Rolls
        cursor.execute("SELECT count(*) FROM electoral_rolls")
        roll_count = cursor.fetchone()[0]
        print(f"Total Uploads (electoral_rolls): {roll_count}")
        
        if roll_count > 0:
            cursor.execute("SELECT upload_id, filename, row_count FROM electoral_rolls ORDER BY id DESC LIMIT 5")
            for row in cursor.fetchall():
                print(f" - Upload: {row}")
                
            # Check Voter Records
            last_id = row[0]
            cursor.execute(f"SELECT count(*) FROM voter_records WHERE upload_id = ?", (last_id,))
            voter_count = cursor.fetchone()[0]
            print(f"Voter Records for upload {last_id}: {voter_count}")
            
            # Check for Null Constituency
            cursor.execute(f"SELECT count(*) FROM voter_records WHERE upload_id = ? AND (constituency IS NULL OR constituency = '')", (last_id,))
            null_const = cursor.fetchone()[0]
            print(f"NULL/Empty Constituency count: {null_const}")

            # Sample Data
            cursor.execute(f"SELECT voter_id, name, age, constituency FROM voter_records WHERE upload_id = ? LIMIT 5", (last_id,))
            print("Sample Data:")
            for row in cursor.fetchall():
                print(f" - {row}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect_db_raw()
