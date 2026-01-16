import csv
import random
import uuid
from datetime import datetime, timedelta

def generate_voter(voter_id, age=None, constituency="AC-103"):
    if age is None:
        age = random.randint(18, 90)
    
    first_names = ["Aarav", "Vihaan", "Aditya", "Sai", "Vivaan", "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara"]
    last_names = ["Patil", "Deshmukh", "Joshi", "Kulkarni", "Mehta", "Shah", "Khan", "Shaikh", "Singh", "Sharma"]
    
    name = f"{random.choice(first_names)} {random.choice(last_names)}"
    
    return [
        voter_id,
        name,
        age,
        f"{random.randint(1, 999)}, MG Road, Ward {random.randint(1, 20)}",
        (datetime.now() - timedelta(days=random.randint(30, 3000))).strftime("%Y-%m-%d"),
        constituency
    ]

def generate_datasets():
    print("Generating forensic test datasets...")
    
    # Base Headers
    headers = ['voter_id', 'name', 'age', 'address', 'registration_date', 'constituency']
    
    # 1. Snapshot Jan (Baseline) - 2000 voters
    voters = []
    # Create 150 young voters (susceptible to deletion)
    young_voters = []
    for i in range(150):
        vid = f"VOTER_Y_{i:04d}"
        row = generate_voter(vid, age=random.randint(18, 25)) # Explicitly young
        young_voters.append(row)
        voters.append(row)
        
    # Create 20 potential migrants
    migrant_voters = []
    for i in range(20):
        vid = f"VOTER_M_{i:04d}"
        row = generate_voter(vid)
        migrant_voters.append(row)
        voters.append(row)
        
    # Create rest (Normal)
    for i in range(2000 - 150 - 20):
        vid = f"VOTER_N_{i:05d}"
        voters.append(generate_voter(vid))
        
    # Save Jan Snapshot
    with open('snapshot_jan_2024.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(voters)
    print("✅ Created snapshot_jan_2024.csv (2000 voters)")
    
    # 2. Snapshot Apr (After Changes)
    # - Delete ALL 150 young voters
    # - Migrate ALL 20 migrants to new constituency
    # - Keep others same
    
    apr_voters = []
    
    # Add migrants with CHANGED constituency
    for v in migrant_voters:
        new_v = list(v)
        new_v[5] = "AC-057" # Changed from AC-103
        apr_voters.append(new_v)
        
    # Add normal voters (unchanged)
    # Filter out normal voters from original list (they are at the end)
    # Or just regenerate based on ID? No, must match.
    # Re-using the 'voters' list logic:
    # Iterate original voters. If in young_voters -> Skip (Delete). If in migrant_voters -> Modify. Else -> Keep.
    
    young_ids = set(v[0] for v in young_voters)
    migrant_ids = set(v[0] for v in migrant_voters)
    
    final_apr_list = []
    for v in voters:
        vid = v[0]
        if vid in young_ids:
            continue # DELETED
        elif vid in migrant_ids:
            # Modified version already created above, find it?
            # Actually easier to just modify here.
            new_v = list(v)
            new_v[5] = "AC-057"
            final_apr_list.append(new_v)
        else:
            final_apr_list.append(v)
            
    # Save Apr Snapshot
    with open('snapshot_apr_2024.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(final_apr_list)
    print(f"✅ Created snapshot_apr_2024.csv ({len(final_apr_list)} voters)")

if __name__ == "__main__":
    generate_datasets()
