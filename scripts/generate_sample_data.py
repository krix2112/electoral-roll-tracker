"""
Generate Sample Electoral Roll Data for Demo
Creates two CSV files: roll_v1.csv (baseline) and roll_v2.csv (manipulated)

Team: Teen Titans | Snowfrost Hackathon 2026
"""

import pandas as pd
import random
import os

# Set seed for reproducibility
random.seed(42)

# ============================================
# DATA GENERATION HELPERS
# ============================================

FIRST_NAMES = [
    'Raj', 'Priya', 'Amit', 'Anjali', 'Vikram', 'Sanya', 'Arjun', 'Divya',
    'Rohan', 'Kavya', 'Siddharth', 'Meera', 'Aditya', 'Neha', 'Karan', 'Pooja',
    'Rahul', 'Shreya', 'Vivek', 'Ananya', 'Kunal', 'Isha', 'Nikhil', 'Riya',
    'Suresh', 'Deepika', 'Manoj', 'Aishwarya', 'Gaurav', 'Sneha', 'Harsh', 'Kriti',
    'Yash', 'Tanvi', 'Ravi', 'Nisha', 'Akash', 'Swati', 'Varun', 'Pallavi'
]

LAST_NAMES = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Joshi', 'Mehta',
    'Agarwal', 'Verma', 'Malhotra', 'Chopra', 'Kapoor', 'Nair', 'Iyer', 'Rao',
    'Desai', 'Shah', 'Bansal', 'Arora', 'Saxena', 'Tiwari', 'Mishra', 'Jain',
    'Pandey', 'Yadav', 'Khan', 'Ali', 'Hussain', 'Ahmed', 'Kumar', 'Das'
]

GENDERS = ['Male', 'Female', 'Other']

WARDS = ['Ward-10', 'Ward-11', 'Ward-12', 'Ward-13', 'Ward-14']

CONSTITUENCIES = ['North District', 'South District', 'East District', 'West District', 'Central District']

STREETS = [
    'MG Road', 'Gandhi Nagar', 'Park Street', 'Main Road', 'Station Road',
    'Church Street', 'Market Street', 'School Street', 'Hospital Road', 'Temple Street'
]

CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']

def generate_voter_id(index):
    """Generate voter ID in format VOTER_0001"""
    return f'VOTER_{str(index + 1).zfill(4)}'

def generate_name():
    """Generate random first and last name"""
    return random.choice(FIRST_NAMES), random.choice(LAST_NAMES)

def generate_address():
    """Generate realistic address"""
    street = random.choice(STREETS)
    city = random.choice(CITIES)
    house_num = random.randint(1, 999)
    pincode = random.randint(100000, 999999)
    return f'{house_num} {street}, {city} - {pincode}'

def generate_age():
    """Generate age between 18 and 85"""
    return random.randint(18, 85)

def generate_ward():
    """Generate ward"""
    return random.choice(WARDS)

def generate_constituency():
    """Generate constituency"""
    return random.choice(CONSTITUENCIES)

# ============================================
# GENERATE BASELINE (roll_v1.csv)
# ============================================

def generate_baseline_roll(num_voters=900):
    """Generate baseline electoral roll"""
    print(f'Generating baseline roll with {num_voters} voters...')
    
    voters = []
    for i in range(num_voters):
        first_name, last_name = generate_name()
        voters.append({
            'voter_id': generate_voter_id(i),
            'first_name': first_name,
            'last_name': last_name,
            'age': generate_age(),
            'gender': random.choice(GENDERS),
            'address': generate_address(),
            'ward': generate_ward(),
            'constituency': generate_constituency()
        })
    
    df = pd.DataFrame(voters)
    return df

# ============================================
# GENERATE MANIPULATED VERSION (roll_v2.csv)
# ============================================

def generate_manipulated_roll(baseline_df):
    """Generate manipulated version with removals, additions, and modifications"""
    print('Generating manipulated roll...')
    
    df = baseline_df.copy()
    
    # ============================================
    # 1) REMOVALS (40-60 voters, mostly from Ward-12)
    # ============================================
    num_removals = random.randint(40, 60)
    print(f'  Removing {num_removals} voters...')
    
    # Get Ward-12 voters (majority of removals from here)
    ward_12_voters = df[df['ward'] == 'Ward-12'].index.tolist()
    other_voters = df[df['ward'] != 'Ward-12'].index.tolist()
    
    # Remove 70% from Ward-12, 30% from others
    num_from_ward12 = int(num_removals * 0.7)
    num_from_others = num_removals - num_from_ward12
    
    indices_to_remove = (
        random.sample(ward_12_voters, min(num_from_ward12, len(ward_12_voters))) +
        random.sample(other_voters, min(num_from_others, len(other_voters)))
    )
    
    removed_voters = df.loc[indices_to_remove].copy()
    df = df.drop(indices_to_remove).reset_index(drop=True)
    
    # ============================================
    # 2) ADDITIONS (~50 new voters, similar last names, same ward)
    # ============================================
    num_additions = random.randint(45, 55)
    print(f'  Adding {num_additions} new voters...')
    
    # Use similar last names to look suspicious
    suspicious_last_names = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta']
    target_ward = 'Ward-12'  # Same ward as removals
    
    new_voters = []
    start_index = len(baseline_df)  # Start from after baseline IDs
    
    for i in range(num_additions):
        first_name = random.choice(FIRST_NAMES)
        # 60% chance of using suspicious last name
        if random.random() < 0.6:
            last_name = random.choice(suspicious_last_names)
        else:
            last_name = random.choice(LAST_NAMES)
        
        new_voters.append({
            'voter_id': generate_voter_id(start_index + i),
            'first_name': first_name,
            'last_name': last_name,
            'age': generate_age(),
            'gender': random.choice(GENDERS),
            'address': generate_address(),
            'ward': target_ward,  # Same ward as removals
            'constituency': generate_constituency()
        })
    
    new_df = pd.DataFrame(new_voters)
    df = pd.concat([df, new_df], ignore_index=True)
    
    # ============================================
    # 3) MODIFICATIONS (~20 existing voters)
    # ============================================
    num_modifications = random.randint(18, 22)
    print(f'  Modifying {num_modifications} existing voters...')
    
    # Get indices of remaining voters (not the ones we just added)
    existing_indices = df.index[:len(df) - num_additions].tolist()
    indices_to_modify = random.sample(existing_indices, min(num_modifications, len(existing_indices)))
    
    for idx in indices_to_modify:
        # 50% chance to modify age, 50% chance to modify address
        if random.random() < 0.5:
            # Modify age significantly (+15 to +25 years)
            df.at[idx, 'age'] = min(85, df.at[idx, 'age'] + random.randint(15, 25))
        else:
            # Modify address
            df.at[idx, 'address'] = generate_address()
    
    return df, {
        'removed': len(indices_to_remove),
        'added': num_additions,
        'modified': num_modifications
    }

# ============================================
# MAIN EXECUTION
# ============================================

def main():
    print('=' * 60)
    print('ELECTORAL ROLL SAMPLE DATA GENERATOR')
    print('Team: Teen Titans | Snowfrost Hackathon 2026')
    print('=' * 60)
    print()
    
    # Generate baseline
    baseline_df = generate_baseline_roll(900)
    
    # Generate manipulated version
    manipulated_df, stats = generate_manipulated_roll(baseline_df)
    
    # Create output directory if it doesn't exist
    output_dir = 'scripts/output'
    os.makedirs(output_dir, exist_ok=True)
    
    # Save files
    baseline_path = os.path.join(output_dir, 'roll_v1.csv')
    manipulated_path = os.path.join(output_dir, 'roll_v2.csv')
    
    baseline_df.to_csv(baseline_path, index=False)
    print(f'✓ Saved: {baseline_path}')
    
    manipulated_df.to_csv(manipulated_path, index=False)
    print(f'✓ Saved: {manipulated_path}')
    
    # Print summary
    print()
    print('=' * 60)
    print('SUMMARY')
    print('=' * 60)
    print(f'Baseline (roll_v1.csv):     {len(baseline_df)} voters')
    print(f'Manipulated (roll_v2.csv):  {len(manipulated_df)} voters')
    print()
    print('Changes in roll_v2:')
    print(f'  - Removed:  {stats["removed"]} voters')
    print(f'  - Added:    {stats["added"]} voters')
    print(f'  - Modified: {stats["modified"]} voters')
    print()
    print('✅ Sample data generation complete!')
    print('=' * 60)

if __name__ == '__main__':
    main()
