import json
import random
import os
from datetime import datetime, timedelta
try:
    from faker import Faker
    fake = Faker('en_IN')
    HAS_FAKER = True
except ImportError:
    HAS_FAKER = False
    print("Warning: faker not found, using simple mock for geo/names")

def generate_constituency(const_id, name, state):
    """Generate one constituency"""
    voter_count = random.randint(150000, 300000)
    lat = fake.latitude() if HAS_FAKER else 19.0760 + random.uniform(-1, 1)
    lng = fake.longitude() if HAS_FAKER else 72.8777 + random.uniform(-1, 1)
    return {
        "id": const_id,
        "name": name,
        "state": state,
        "voter_count": voter_count,
        "geo_center": [float(lat), float(lng)],
        "polling_stations": [f"PS-{i:02d}" for i in range(1, random.randint(10, 20))]
    }

def generate_voter_tokens(count, age_bias=None):
    """Generate anonymous voter tokens with optional age bias"""
    voters = []
    for i in range(count):
        if age_bias == "young":
            age = random.randint(18, 25)  # Mostly young
        elif age_bias == "old":
            age = random.randint(60, 85)  # Mostly old
        else:
            age = random.randint(18, 85)
        
        voters.append({
            "token": f"v_{i:06d}",
            "age": age,
            "gender": random.choice(["M", "F"]),
            "polling_station": f"PS-{random.randint(1, 15):02d}"
        })
    return voters

def generate_snapshot(constituency, date_str, anomaly_type=None):
    """Generate a snapshot, with optional anomaly"""
    base_voters = 200000
    
    if anomaly_type == "mass_deletion_young":
        # 15% of young voters disappear
        voter_count = int(base_voters * 0.85)
        voters = generate_voter_tokens(voter_count, "old")  # Bias toward old
        breakdown = {"age_18_25": 20000, "age_26_35": 60000, "age_36_50": 55000, "age_51_plus": 50000}
        
    elif anomaly_type == "normal":
        voter_count = base_voters
        voters = generate_voter_tokens(voter_count)
        breakdown = {"age_18_25": 40000, "age_26_35": 60000, "age_36_50": 55000, "age_51_plus": 45000}
    
    else:
        voter_count = base_voters
        voters = generate_voter_tokens(voter_count)
        breakdown = {"age_18_25": 40000, "age_26_35": 60000, "age_36_50": 55000, "age_51_plus": 45000}
    
    return {
        "snapshot_id": f"{date_str}_{constituency['id']}",
        "date": date_str,
        "constituency_id": constituency["id"],
        "total_voters": voter_count,
        "breakdown": breakdown,
        "voter_samples": voters[:1000]  # Just sample for demo
    }

# Create directories if they don't exist
os.makedirs('backend/data/snapshots', exist_ok=True)

# Generate data
constituencies = [
    generate_constituency("AC-042", "Mumbai North", "Maharashtra"),
    generate_constituency("AC-057", "South Delhi", "Delhi"),
    generate_constituency("AC-033", "Bangalore South", "Karnataka")
]

# Save constituencies
with open('backend/data/constituencies.json', 'w') as f:
    json.dump(constituencies, f, indent=2)

# Generate snapshots for each constituency
for const in constituencies:
    # Normal snapshot
    snap1 = generate_snapshot(const, "2024-01-01", "normal")
    with open(f'backend/data/snapshots/{const["id"]}_2024_01_01.json', 'w') as f:
        json.dump(snap1, f, indent=2)
    
    # Anomalous snapshot for AC-042 only (your demo constituency)
    if const["id"] == "AC-042":
        snap2 = generate_snapshot(const, "2024-04-01", "mass_deletion_young")
    else:
        snap2 = generate_snapshot(const, "2024-04-01", "normal")
    
    with open(f'backend/data/snapshots/{const["id"]}_2024_04_01.json', 'w') as f:
        json.dump(snap2, f, indent=2)

print("✅ Data generated! Check backend/data/ folder")
