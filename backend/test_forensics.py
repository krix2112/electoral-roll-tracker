"""
Quick test script for RollDiff forensic modules
"""

import sys
sys.path.insert(0, '.')

from forensics.fusion import MultiSignalFusionEngine

# Sample test data
current_voters = [
    {'voter_id': 'V001', 'name': 'Raj Kumar 1', 'age': 30, 'address': '123 Main St Mumbai', 'registration_date': '2024-01-15'},
    {'voter_id': 'V002', 'name': 'Raj Kumar 2', 'age': 31, 'address': '123 Main St Mumbai', 'registration_date': '2024-01-15'},
    {'voter_id': 'V003', 'name': 'Raj Kumar 3', 'age': 32, 'address': '123 Main St Mumbai', 'registration_date': '2024-01-15'},
    {'voter_id': 'V004', 'name': 'Raj Kumar 4', 'age': 33, 'address': '123 Main St Mumbai', 'registration_date': '2024-01-15'},
    {'voter_id': 'V005', 'name': 'Raj Kumar 5', 'age': 34, 'address': '123 Main St Mumbai', 'registration_date': '2024-01-15'},
]

previous_voters = []

# Initialize fusion engine
print("🔬 Testing RollDiff Forensic System\n")
print("=" * 60)

engine = MultiSignalFusionEngine()

# Run analysis
result = engine.analyze(current_voters, previous_voters)

# Display results
print(f"\n📊 FINAL ANOMALY SCORE: {result['final_anomaly_score']}")
print(f"🎯 VERDICT: {result['verdict']}")
print(f"✅ CONFIDENCE: {result['confidence_level']}\n")

print("📋 MODULE BREAKDOWNS:")
print("-" * 60)
for module in result['module_breakdowns']:
    print(f"\n{module['module']}:")
    print(f"  Score: {module['score']}")
    print(f"  Weight: {module['weight']}")
    print(f"  Contribution: {module['contribution']}")
    if module['evidence']:
        print(f"  Evidence:")
        for evidence in module['evidence']:
            print(f"    - {evidence}")

print("\n" + "=" * 60)
print(f"\n💬 SUMMARY:\n{result['summary']}\n")

print("✅ Forensic system test complete!")
