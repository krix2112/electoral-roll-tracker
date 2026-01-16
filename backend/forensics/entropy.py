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
    
    def analyze(self, current_voters: List[Dict], previous_voters: List[Dict] = None) -> Dict[str, Any]:
        """
        Analyze entropy in voter data
        
        Args:
            current_voters: List of current voter records
            previous_voters: Optional list of previous voter records (unused for now)
            
        Returns:
            Dict with entropy_score (0-100) and evidence
        """
        if not current_voters:
            return {
                'entropy_score': 0,
                'evidence': [],
                'details': 'No voter data to analyze'
            }
        
        # Extract fields for entropy analysis
        names = [v.get('name', '') for v in current_voters]
        ages = [str(v.get('age', '')) for v in current_voters]
        registration_dates = [v.get('registration_date', '') for v in current_voters]
        addresses = [v.get('address', '') for v in current_voters]
        
        # Calculate entropy for each field
        name_entropy = self._calculate_shannon_entropy(names)
        age_entropy = self._calculate_shannon_entropy(ages)
        date_entropy = self._calculate_shannon_entropy(registration_dates)
        address_entropy = self._calculate_shannon_entropy(addresses)
        
        # Calculate maximum possible entropy (log2 of unique values)
        max_name_entropy = math.log2(len(set(names))) if len(set(names)) > 1 else 1
        max_age_entropy = math.log2(len(set(ages))) if len(set(ages)) > 1 else 1
        max_date_entropy = math.log2(len(set(registration_dates))) if len(set(registration_dates)) > 1 else 1
        max_address_entropy = math.log2(len(set(addresses))) if len(set(addresses)) > 1 else 1
        
        # Normalize entropy scores (0-1)
        norm_name_entropy = self._normalize_entropy(name_entropy, max_name_entropy)
        norm_age_entropy = self._normalize_entropy(age_entropy, max_age_entropy)
        norm_date_entropy = self._normalize_entropy(date_entropy, max_date_entropy)
        norm_address_entropy = self._normalize_entropy(address_entropy, max_address_entropy)
        
        # Detect low entropy patterns
        LOW_ENTROPY_THRESHOLD = 0.5  # Below this is suspicious
        
        anomalies = []
        evidence = []
        
        # Check for synthetic name patterns
        if norm_name_entropy < LOW_ENTROPY_THRESHOLD:
            # Look for sequential patterns (e.g., "Raj Kumar 1", "Raj Kumar 2")
            name_counter = Counter(names)
            most_common = name_counter.most_common(3)
            if most_common and most_common[0][1] > len(current_voters) * 0.1:
                anomalies.append('name')
                evidence.append(
                    f"📝 **Low Name Diversity**: Top name '{most_common[0][0]}' appears {most_common[0][1]} times (entropy: {norm_name_entropy:.2f})"
                )
        
        # Check for suspicious age patterns
        if norm_age_entropy < LOW_ENTROPY_THRESHOLD:
            age_counter = Counter(ages)
            most_common_age = age_counter.most_common(1)
            if most_common_age and most_common_age[0][1] > len(current_voters) * 0.15:
                anomalies.append('age')
                evidence.append(
                    f"🎂 **Age Clustering**: {most_common_age[0][1]} voters have age {most_common_age[0][0]} (entropy: {norm_age_entropy:.2f})"
                )
        
        # Check for bulk registration patterns
        if norm_date_entropy < LOW_ENTROPY_THRESHOLD:
            date_counter = Counter(registration_dates)
            most_common_date = date_counter.most_common(1)
            if most_common_date and most_common_date[0][1] > len(current_voters) * 0.2:
                anomalies.append('date')
                evidence.append(
                    f"📅 **Bulk Registration Alert**: {most_common_date[0][1]} voters registered on {most_common_date[0][0]} (entropy: {norm_date_entropy:.2f})"
                )
        
        # Check for address duplication
        if norm_address_entropy < LOW_ENTROPY_THRESHOLD:
            address_counter = Counter(addresses)
            most_common_addr = address_counter.most_common(1)
            if most_common_addr and most_common_addr[0][1] > 10:
                anomalies.append('address')
                addr_preview = most_common_addr[0][0][:40] + '...' if len(most_common_addr[0][0]) > 40 else most_common_addr[0][0]
                evidence.append(
                    f"🏠 **Address Duplication**: {most_common_addr[0][1]} voters at '{addr_preview}' (entropy: {norm_address_entropy:.2f})"
                )
        
        # Calculate entropy score (0-100, higher = more anomalous)
        # Lower entropy = higher anomaly score
        avg_entropy = (norm_name_entropy + norm_age_entropy + norm_date_entropy + norm_address_entropy) / 4
        
        # Invert: low entropy = high score
        entropy_score = (1 - avg_entropy) * 100
        
        # Boost score for multiple anomalies
        anomaly_boost = len(anomalies) * 10
        final_score = min(100, entropy_score + anomaly_boost)
        
        return {
            'entropy_score': round(final_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': len(current_voters),
                'name_entropy': round(norm_name_entropy, 3),
                'age_entropy': round(norm_age_entropy, 3),
                'date_entropy': round(norm_date_entropy, 3),
                'address_entropy': round(norm_address_entropy, 3),
                'anomalies_detected': anomalies
            }
        }
