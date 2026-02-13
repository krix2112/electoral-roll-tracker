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
    
    def analyze(self, current_df: Any, previous_df: Any = None) -> Dict[str, Any]:
        """
        Analyze behavioral patterns using DataFrames
        
        Args:
            current_df: DataFrame of current voter records
            previous_df: Optional DataFrame of previous voter records
            
        Returns:
            Dict with behavior_score (0-100) and evidence
        """
        if current_df is None or current_df.empty or previous_df is None or previous_df.empty:
            return {
                'behavior_score': 0,
                'evidence': [],
                'details': 'Insufficient data for behavioral analysis'
            }
            
        # 1. MAP AGE GROUPS
        def map_age(age):
            if age <= 25: return '18-25'
            if age <= 35: return '26-35'
            if age <= 50: return '36-50'
            if age <= 65: return '51-65'
            return '65+'
            
        current_df['age_group'] = current_df['age'].apply(map_age)
        previous_df['age_group'] = previous_df['age'].apply(map_age)
        
        # 2. IDENTIFY DELETIONS
        prev_ids = set(previous_df['voter_id'])
        curr_ids = set(current_df['voter_id'])
        
        deleted_df = previous_df[~previous_df['voter_id'].isin(curr_ids)]
        deletion_rate = len(deleted_df) / len(previous_df)
        
        suspicious_patterns = []
        if deletion_rate > 0.05:
            # Check for concentration in age groups
            del_age_counts = deleted_df['age_group'].value_counts()
            if not del_age_counts.empty and (del_age_counts.iloc[0] / len(deleted_df) > 0.7):
                suspicious_patterns.append(
                    f"🚨 **Mass Deletion Alert**: {len(deleted_df)} voters deleted ({(deletion_rate*100):.1f}%). "
                    f"{(del_age_counts.iloc[0]/len(deleted_df))*100:.0f}% were {del_age_counts.index[0]} (Targeted Deletion)."
                )

        # 3. IDENTIFY MIGRATIONS (Address changes among common voters)
        common_df = current_df.merge(previous_df[['voter_id', 'address', 'age_group']], on='voter_id', suffixes=('', '_prev'))
        common_df['moved'] = common_df['address'] != common_df['address_prev']
        
        # Calculate rates by age group
        group_stats = common_df.groupby('age_group')['moved'].agg(['sum', 'count'])
        group_stats['rate'] = group_stats['sum'] / group_stats['count']
        
        anomaly_indicators = []
        total_deviation = 0
        
        for group, expected in self.AGE_MIGRATION_BASELINE.items():
            if group in group_stats.index:
                actual = group_stats.loc[group, 'rate']
                deviation = abs(actual - expected)
                if deviation > expected * 0.5:
                    anomaly_indicators.append({
                        'age_group': group,
                        'expected_rate': f"{expected * 100:.1f}%",
                        'actual_rate': f"{actual * 100:.1f}%"
                    })
                total_deviation += deviation
                
        # 4. SUSPICIOUS NEW REGISTRATIONS
        new_voters_df = current_df[~current_df['voter_id'].isin(prev_ids)]
        if not new_voters_df.empty:
            new_age_counts = new_voters_df['age_group'].value_counts()
            if (new_age_counts.iloc[0] / len(new_voters_df) > 0.7):
                suspicious_patterns.append(
                    f"{(new_age_counts.iloc[0]/len(new_voters_df))*100:.0f}% of new voters are in {new_age_counts.index[0]} group"
                )
                
        # SCORE CALCULATION
        base_score = min(100, total_deviation * 200)
        pattern_boost = len(suspicious_patterns) * 15
        behavior_score = min(100, base_score + pattern_boost)
        
        # EVIDENCE
        evidence = []
        if anomaly_indicators:
            evidence.append(f"⚠️ **Age-Migration Mismatch**: {len(anomaly_indicators)} groups show abnormal patterns")
        if suspicious_patterns:
            evidence.extend([f"🔍 {p}" for p in suspicious_patterns])
        
        addr_change_count = common_df['moved'].sum()
        if addr_change_count > len(current_df) * 0.3:
            evidence.append(f"📍 **High Mobility**: {addr_change_count} address changes ({(addr_change_count/len(current_df))*100:.1f}%)")
            
        return {
            'behavior_score': round(behavior_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': len(current_df),
                'new_voters': len(new_voters_df),
                'address_changes': int(addr_change_count),
                'age_group_anomalies': anomaly_indicators
            }
        }
