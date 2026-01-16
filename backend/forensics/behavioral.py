"""
Module A: Behavioral Fingerprinting Engine
Analyzes deviation from expected organic migration patterns
"""

from typing import List, Dict, Any


class BehavioralFingerprintEngine:
    """
    Detects anomalies based on behavioral patterns in voter demographics
    and change metadata. Calculates deviation from expected organic migration.
    """
    
    # Expected migration rates by age group (baseline)
    AGE_MIGRATION_BASELINE = {
        '18-25': 0.35,  # Young adults move frequently
        '26-35': 0.25,  # Early career mobility
        '36-50': 0.15,  # Settled, less mobile
        '51-65': 0.08,  # Established, minimal movement
        '65+': 0.05     # Elderly, very stable
    }
    
    def __init__(self):
        self.name = "Behavioral Fingerprinting"
        self.weight = 0.25
    
    def _get_age_group(self, age: int) -> str:
        """Categorize age into migration groups"""
        if age < 18:
            return '18-25'  # Treat minors as young adults for baseline
        elif age <= 25:
            return '18-25'
        elif age <= 35:
            return '26-35'
        elif age <= 50:
            return '36-50'
        elif age <= 65:
            return '51-65'
        else:
            return '65+'
    
    def analyze(self, current_voters: List[Dict], previous_voters: List[Dict]) -> Dict[str, Any]:
        """
        Analyze behavioral patterns in voter data
        
        Args:
            current_voters: List of current voter records
            previous_voters: List of previous voter records
            
        Returns:
            Dict with behavior_score (0-100) and evidence
        """
        if not current_voters or not previous_voters:
            return {
                'behavior_score': 0,
                'evidence': [],
                'details': 'Insufficient data for behavioral analysis'
            }
        
        # Build lookup for previous voters
        prev_lookup = {v['voter_id']: v for v in previous_voters}
        
        # Track changes by age group
        age_group_changes = {group: {'moved': 0, 'total': 0} for group in self.AGE_MIGRATION_BASELINE.keys()}
        new_registrations_by_age = {group: 0 for group in self.AGE_MIGRATION_BASELINE.keys()}
        
        address_changes = 0
        new_voters = 0
        suspicious_patterns = []
        
        for voter in current_voters:
            age = voter.get('age', 25)
            age_group = self._get_age_group(age)
            voter_id = voter.get('voter_id')
            
            if voter_id in prev_lookup:
                # Existing voter - check for changes
                prev_voter = prev_lookup[voter_id]
                age_group_changes[age_group]['total'] += 1
                
                # Check address change
                if voter.get('address') != prev_voter.get('address'):
                    age_group_changes[age_group]['moved'] += 1
                    address_changes += 1
            else:
                # New voter
                new_voters += 1
                new_registrations_by_age[age_group] += 1
        
        # Check for MASS DELETIONS
        current_voter_ids = set(v['voter_id'] for v in current_voters)
        deleted_voters = [v for v in previous_voters if v['voter_id'] not in current_voter_ids]
        deleted_count = len(deleted_voters)
        
        deleted_registrations_by_age = {group: 0 for group in self.AGE_MIGRATION_BASELINE.keys()}
        for dv in deleted_voters:
            age = dv.get('age', 25)
            age_group = self._get_age_group(age)
            deleted_registrations_by_age[age_group] += 1

        # Calculate deletion rate
        deletion_rate = deleted_count / len(previous_voters) if previous_voters else 0
        
        # Flag Mass Deletion (> 5% of roll)
        if deletion_rate > 0.05:
            # Check for concentration
             for age_group, count in deleted_registrations_by_age.items():
                if count > 0 and (count / deleted_count > 0.7):
                    suspicious_patterns.append(
                        f"🚨 **Mass Deletion Alert**: {deleted_count} voters deleted ({(deletion_rate*100):.1f}%). {(count/deleted_count)*100:.0f}% were {age_group} (Targeted Deletion Pattern)."
                    )
        
        # Calculate deviation from expected patterns
        anomaly_indicators = []
        total_deviation = 0
        
        for age_group, stats in age_group_changes.items():
            if stats['total'] > 0:
                actual_rate = stats['moved'] / stats['total']
                expected_rate = self.AGE_MIGRATION_BASELINE[age_group]
                deviation = abs(actual_rate - expected_rate)
                
                # Flag if deviation > 50% of expected
                if deviation > expected_rate * 0.5:
                    anomaly_indicators.append({
                        'age_group': age_group,
                        'expected_rate': f"{expected_rate * 100:.1f}%",
                        'actual_rate': f"{actual_rate * 100:.1f}%",
                        'deviation': f"{deviation * 100:.1f}%"
                    })
                
                total_deviation += deviation
        
        # Check for suspicious new registration patterns
        total_new = sum(new_registrations_by_age.values())
        if total_new > 0:
            # Flag if >70% of new registrations are in a single age group
            for age_group, count in new_registrations_by_age.items():
                if count / total_new > 0.7:
                    suspicious_patterns.append(
                        f"{(count/total_new)*100:.0f}% of new voters are in {age_group} age group (unusual concentration)"
                    )
        
        # Calculate behavior score (0-100, higher = more anomalous)
        # Base score on total deviation
        base_score = min(100, total_deviation * 200)  # Scale deviation to 0-100
        
        # Boost score for suspicious patterns
        pattern_boost = len(suspicious_patterns) * 15
        
        behavior_score = min(100, base_score + pattern_boost)
        
        # Build evidence list
        evidence = []
        if anomaly_indicators:
            evidence.append(f"⚠️ **Age-Migration Mismatch**: {len(anomaly_indicators)} age groups show abnormal movement patterns")
        if suspicious_patterns:
            evidence.extend([f"🔍 {pattern}" for pattern in suspicious_patterns])
        if address_changes > len(current_voters) * 0.3:
            evidence.append(f"📍 **High Mobility**: {address_changes} address changes ({(address_changes/len(current_voters))*100:.1f}% of voters)")
        
        return {
            'behavior_score': round(behavior_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': len(current_voters),
                'new_voters': new_voters,
                'address_changes': address_changes,
                'age_group_anomalies': anomaly_indicators,
                'suspicious_patterns': suspicious_patterns
            }
        }
