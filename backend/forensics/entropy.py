"""
Module C: Entropy Analysis Engine
Calculates Shannon entropy to detect synthetic data patterns
"""

import math
from typing import List, Dict, Any
from collections import Counter


class EntropyAnalysisEngine:
    """
    Analyzes entropy in voter data fields (names, ages, registration dates).
    Low entropy indicates synthetic or fabricated data.
    """
    
    def __init__(self):
        self.name = "Entropy Analysis"
        self.weight = 0.25
    
    def _calculate_shannon_entropy(self, values: List[str]) -> float:
        """
        Calculate Shannon entropy for a list of values
        H = -Σ(p(x) * log2(p(x)))
        
        Returns:
            Entropy value (0 = no diversity, higher = more diverse)
        """
        if not values:
            return 0.0
        
        # Count frequencies
        counter = Counter(values)
        total = len(values)
        
        # Calculate entropy
        entropy = 0.0
        for count in counter.values():
            probability = count / total
            if probability > 0:
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    def _normalize_entropy(self, entropy: float, max_possible: float) -> float:
        """Normalize entropy to 0-1 scale"""
        if max_possible == 0:
            return 0
        return min(1.0, entropy / max_possible)
    
    def analyze(self, current_df: Any, previous_df: Any = None) -> Dict[str, Any]:
        """
        Analyze entropy in voter data using DataFrames
        
        Args:
            current_df: DataFrame of current voter records
            previous_df: Optional DataFrame of previous voter records
            
        Returns:
            Dict with entropy_score (0-100) and evidence
        """
        if current_df is None or current_df.empty:
            return {'entropy_score': 0, 'evidence': [], 'details': 'No data'}
        
        total_voters = len(current_df)
        
        # Calculate entropy for multiple fields (vectorized using pandas value_counts)
        fields = ['name', 'age', 'registration_date', 'address']
        field_entropies = {}
        
        for field in fields:
            if field in current_df.columns:
                counts = current_df[field].value_counts()
                probs = counts / total_voters
                # H = -Σ(p * log2(p))
                entropy = -(probs * probs.apply(lambda x: math.log2(x) if x > 0 else 0)).sum()
                
                # Max possible entropy = log2 of unique values
                unique_count = len(counts)
                max_entropy = math.log2(unique_count) if unique_count > 1 else 1
                
                # Normalize (0-1)
                normalized = min(1.0, entropy / max_entropy) if max_entropy > 0 else 0
                field_entropies[field] = {
                    'normalized': normalized,
                    'top_val': counts.index[0] if not counts.empty else None,
                    'top_count': counts.iloc[0] if not counts.empty else 0
                }
        
        # Detect low entropy patterns
        LOW_ENTROPY_THRESHOLD = 0.5
        anomalies = []
        evidence = []
        
        # Name Diversity
        name_stats = field_entropies.get('name', {})
        if name_stats.get('normalized', 1.0) < LOW_ENTROPY_THRESHOLD:
            if name_stats.get('top_count', 0) > total_voters * 0.1:
                anomalies.append('name')
                evidence.append(f"📝 **Low Name Diversity**: Top name '{name_stats['top_val']}' appears {name_stats['top_count']} times")
        
        # Age Clustering
        age_stats = field_entropies.get('age', {})
        if age_stats.get('normalized', 1.0) < LOW_ENTROPY_THRESHOLD:
            if age_stats.get('top_count', 0) > total_voters * 0.15:
                anomalies.append('age')
                evidence.append(f"🎂 **Age Clustering**: {age_stats['top_count']} voters have age {age_stats['top_val']}")
        
        # Bulk Registration
        date_stats = field_entropies.get('registration_date', {})
        if date_stats.get('normalized', 1.0) < LOW_ENTROPY_THRESHOLD:
            if date_stats.get('top_count', 0) > total_voters * 0.2:
                anomalies.append('date')
                evidence.append(f"📅 **Bulk Registration Alert**: {date_stats['top_count']} voters registered on {date_stats['top_val']}")
                
        # Address Duplication
        addr_stats = field_entropies.get('address', {})
        if addr_stats.get('normalized', 1.0) < LOW_ENTROPY_THRESHOLD:
            if addr_stats.get('top_count', 0) > 10:
                anomalies.append('address')
                short_addr = str(addr_stats['top_val'])[:40] + '...' if len(str(addr_stats['top_val'])) > 40 else addr_stats['top_val']
                evidence.append(f"🏠 **Address Duplication**: {addr_stats['top_count']} voters at '{short_addr}'")
                
        # Calculate final score
        avg_norm_entropy = sum(f['normalized'] for f in field_entropies.values()) / len(field_entropies) if field_entropies else 1.0
        entropy_score = (1 - avg_norm_entropy) * 100
        
        # Boost for multiple anomalies
        final_score = min(100, entropy_score + (len(anomalies) * 10))
        
        return {
            'entropy_score': round(final_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': total_voters,
                'field_metrics': {k: round(v['normalized'], 3) for k, v in field_entropies.items()},
                'anomalies_detected': anomalies
            }
        }
