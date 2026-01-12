"""Generate demo electoral data"""
import pandas as pd
import random
from datetime import datetime, timedelta
import os

random.seed(42)

def generate_voter_id(index):
    return f'V{str(index+1).zfill(6)}'

def generate_name():
    first = ['Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Sanya', 'Arjun', 'Divya']
    last = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Joshi', 'Mehta']
    return f'{random.choice(first)} {random.choice(last)}'

def generate_address():
    streets = ['MG Road', 'Gandhi Nagar', 'Park Street', 'Main Road']
    cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad']
    return f'{random.randint(1, 999)} {random.choice(streets)}, {random.choice(cities)} - {random.randint(100000, 999999)}'

def generate_date():
    start = datetime(2015, 1, 1)
    end = datetime(2024, 12, 31)
    delta = end - start
    return (start + timedelta(days=random.randint(0, delta.days))).strftime('%Y-%m-%d')

def generate_base_roll(count=2000):
    print(f'Generating base roll with {count} voters...')
    voters = []
    for i in range(count):
        voters.append({
            'voter_id': generate_voter_id(i),
            'name': generate_name(),
            'age': random.randint(18, 85),
            'address': generate_address(),
            'registration_date': generate_date()
        })
    return pd.DataFrame(voters)

def scenario_bulk_deletion(base_df):
    print('Scenario 1: Bulk Deletion (500 voters)...')
    modified_df = base_df.copy()
    delete_indices = random.sample(range(len(modified_df)), 500)
    return modified_df.drop(delete_indices).reset_index(drop=True)

def scenario_suspicious_additions(base_df):
    print('Scenario 2: Suspicious Same-Day Additions (300 voters)...')
    modified_df = base_df.copy()
    new_voters = []
    start_index = len(base_df)
    for i in range(300):
        new_voters.append({
            'voter_id': generate_voter_id(start_index + i),
            'name': generate_name(),
            'age': random.randint(18, 85),
            'address': generate_address(),
            'registration_date': '2026-01-01'
        })
    return pd.concat([modified_df, pd.DataFrame(new_voters)], ignore_index=True)

def scenario_modifications(base_df):
    print('Scenario 3: Data Modifications (50 voters)...')
    modified_df = base_df.copy()
    for idx in random.sample(range(len(modified_df)), 50):
        if random.random() > 0.5:
            modified_df.at[idx, 'address'] = generate_address()
        else:
            modified_df.at[idx, 'age'] = random.randint(18, 85)
    return modified_df

print('='*60)
print('ELECTORAL ROLL DEMO DATA GENERATOR')
print('Team: Teen Titans | Snowfrost Hackathon 2026')
print('='*60)

os.makedirs('demo_data', exist_ok=True)

base_roll = generate_base_roll(2000)
base_roll.to_csv('demo_data/demo_january_2026.csv', index=False)
print('✓ Saved: demo_data/demo_january_2026.csv')

scenario1 = scenario_bulk_deletion(base_roll)
scenario1.to_csv('demo_data/demo_february_2026_deletions.csv', index=False)
print('✓ Saved: demo_data/demo_february_2026_deletions.csv')

scenario2 = scenario_suspicious_additions(base_roll)
scenario2.to_csv('demo_data/demo_march_2026_suspicious.csv', index=False)
print('✓ Saved: demo_data/demo_march_2026_suspicious.csv')

scenario3 = scenario_modifications(base_roll)
scenario3.to_csv('demo_data/demo_april_2026_modifications.csv', index=False)
print('✓ Saved: demo_data/demo_april_2026_modifications.csv')

print('\n✅ ALL DEMO DATA FILES GENERATED SUCCESSFULLY')
print('='*60)
