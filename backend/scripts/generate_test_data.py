"""
Synthetic Voter Data Generator with Embedded Anomalies
Creates realistic voter data with subtle anomaly patterns for RollDiff testing
"""

import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

# Sample data pools
FIRST_NAMES = [
    'Amit', 'Priya', 'Rahul', 'Sita', 'Mohammad', 'Anita', 'Karan', 'Lakshmi',
    'Vikram', 'Deepa', 'Rajesh', 'Sunita', 'Arjun', 'Meera', 'Suresh', 'Kavita',
    'Ravi', 'Pooja', 'Anil', 'Rekha', 'Manoj', 'Geeta', 'Sandeep', 'Nisha'
]

LAST_NAMES = [
    'Sharma', 'Singh', 'Verma', 'Devi', 'Ali', 'Desai', 'Kapoor', 'Narayan',
    'Malhotra', 'Patel', 'Kumar', 'Reddy', 'Rao', 'Gupta', 'Joshi', 'Nair',
    'Mehta', 'Shah', 'Iyer', 'Pillai', 'Khan', 'Agarwal', 'Banerjee', 'Chatterjee'
]

STREETS = [
    'Main St', 'Park Ave', 'Lake Rd', 'Hill View', 'Market St', 'College Ln',
    'Temple St', 'Mall Rd', 'River Bed', 'Garden Enclave', 'Station Rd', 'Church St',
    'MG Road', 'Brigade Rd', 'Commercial St', 'Residency Rd', 'Koramangala', 'Indiranagar'
]

CITIES = [
    'Delhi', 'Mumbai', 'Bangalore', 'Kolkata', 'Chennai', 'Pune', 'Hyderabad',
    'Chandigarh', 'Kochi', 'Jaipur', 'Ahmedabad', 'Lucknow', 'Bhopal', 'Patna'
]

CONSTITUENCIES = [
    'AC-101', 'AC-102', 'AC-103', 'AC-104', 'AC-105', 'AC-106', 'AC-107', 'AC-108'
]


def generate_normal_voter(voter_id_num):
    """Generate a normal, realistic voter record"""
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    name = f"{first_name} {last_name}"
    
    # Realistic age distribution
    age = random.choices(
        range(18, 90),
        weights=[2 if 18 <= a <= 35 else 1.5 if 36 <= a <= 60 else 0.5 for a in range(18, 90)]
    )[0]
    
    # Normal address
    street_num = random.randint(1, 999)
    street = random.choice(STREETS)
    city = random.choice(CITIES)
    address = f"{street_num} {street} {city}"
    
    # Normal registration date (spread over past 2 years)
    days_ago = random.randint(0, 730)
    reg_date = (datetime.now() - timedelta(days=days_ago)).strftime('%Y-%m-%d')
    
    constituency = random.choice(CONSTITUENCIES)
    
    return {
        'voter_id': f'V{voter_id_num:05d}',
        'name': name,
        'age': age,
        'address': address,
        'constituency': constituency,
        'registration_date': reg_date
    }


def generate_anomalous_batch(start_id, count, anomaly_type):
    """Generate a batch of voters with specific anomaly patterns"""
    voters = []
    
    if anomaly_type == 'low_name_entropy':
        # Many voters with similar names (sequential pattern)
        base_name = "Raj Kumar"
        for i in range(count):
            voters.append({
                'voter_id': f'V{start_id + i:05d}',
                'name': f"{base_name} {i+1}",
                'age': random.randint(25, 45),
                'address': f"{random.randint(1, 100)} {random.choice(STREETS)} {random.choice(CITIES)}",
                'constituency': 'AC-103',
                'registration_date': '2024-01-15'
            })
    
    elif anomaly_type == 'bulk_registration':
        # Many voters registered on same day
        same_date = '2024-01-15'
        for i in range(count):
            voters.append({
                'voter_id': f'V{start_id + i:05d}',
                'name': f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                'age': random.randint(18, 70),
                'address': f"{random.randint(1, 999)} {random.choice(STREETS)} {random.choice(CITIES)}",
                'constituency': 'AC-103',
                'registration_date': same_date
            })
    
    elif anomaly_type == 'star_cluster':
        # Too many voters at one address
        shared_address = "123 Suspicious Building Mumbai"
        for i in range(count):
            voters.append({
                'voter_id': f'V{start_id + i:05d}',
                'name': f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}",
                'age': random.randint(18, 70),
                'address': shared_address,
                'constituency': 'AC-103',
                'registration_date': (datetime.now() - timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d')
            })
    
    elif anomaly_type == 'island_nodes':
        # Voters with no connections (unique addresses, unique surnames)
        unique_surnames = [f"Unique{i}" for i in range(count)]
        for i in range(count):
            voters.append({
                'voter_id': f'V{start_id + i:05d}',
                'name': f"{random.choice(FIRST_NAMES)} {unique_surnames[i]}",
                'age': random.randint(18, 70),
                'address': f"{random.randint(1, 999)} Isolated Lane Unit {i} {random.choice(CITIES)}",
                'constituency': 'AC-103',
                'registration_date': '2024-02-20'
            })
    
    return voters


def generate_dataset(filename, total_voters=5000, anomaly_percentage=0.15):
    """
    Generate a complete dataset with embedded anomalies
    
    Args:
        filename: Output CSV filename
        total_voters: Total number of voters to generate
        anomaly_percentage: Percentage of voters that should be anomalous
    """
    voters = []
    voter_id = 1
    
    # Calculate anomaly counts
    anomaly_count = int(total_voters * anomaly_percentage)
    normal_count = total_voters - anomaly_count
    
    # Generate normal voters
    print(f"Generating {normal_count} normal voters...")
    for _ in range(normal_count):
        voters.append(generate_normal_voter(voter_id))
        voter_id += 1
    
    # Generate anomalous batches
    print(f"Generating {anomaly_count} anomalous voters...")
    
    # Distribute anomalies across types
    batch_size = anomaly_count // 4
    
    # Low name entropy batch
    voters.extend(generate_anomalous_batch(voter_id, batch_size, 'low_name_entropy'))
    voter_id += batch_size
    
    # Bulk registration batch
    voters.extend(generate_anomalous_batch(voter_id, batch_size, 'bulk_registration'))
    voter_id += batch_size
    
    # Star cluster batch
    voters.extend(generate_anomalous_batch(voter_id, batch_size, 'star_cluster'))
    voter_id += batch_size
    
    # Island nodes batch
    remaining = anomaly_count - (batch_size * 3)
    voters.extend(generate_anomalous_batch(voter_id, remaining, 'island_nodes'))
    
    # Shuffle to mix anomalies with normal data
    random.shuffle(voters)
    
    # Write to CSV
    output_path = Path(__file__).parent.parent / 'demo_data' / filename
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['voter_id', 'name', 'age', 'address', 'constituency', 'registration_date'])
        writer.writeheader()
        writer.writerows(voters)
    
    print(f"✅ Generated {len(voters)} voters in {output_path}")
    print(f"   - Normal voters: {normal_count}")
    print(f"   - Anomalous voters: {anomaly_count}")
    print(f"   - Anomaly rate: {anomaly_percentage * 100:.1f}%")


if __name__ == '__main__':
    # Generate current roll with anomalies
    generate_dataset('current_roll_with_anomalies.csv', total_voters=5000, anomaly_percentage=0.15)
    
    # Generate previous roll (mostly normal)
    generate_dataset('previous_roll_baseline.csv', total_voters=4500, anomaly_percentage=0.02)
    
    print("\n🎉 Synthetic data generation complete!")
    print("Upload these files to test the RollDiff forensic system.")
