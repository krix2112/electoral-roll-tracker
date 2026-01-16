"""
Module B: Network Analysis Engine
Builds voter connection graphs and identifies suspicious patterns
"""

from typing import List, Dict, Any
from collections import defaultdict
import re


class NetworkAnalysisEngine:
    """
    Analyzes voter networks based on shared addresses and surnames.
    Identifies isolated 'island nodes' and unrealistic 'star clusters'.
    """
    
    def __init__(self):
        self.name = "Network Analysis"
        self.weight = 0.35
    
    def _extract_surname(self, name: str) -> str:
        """Extract surname from full name (assumes last word is surname)"""
        if not name:
            return ""
        parts = name.strip().split()
        return parts[-1] if parts else ""
    
    def _normalize_address(self, address: str) -> str:
        """Normalize address for comparison"""
        if not address:
            return ""
        # Remove extra spaces, convert to lowercase
        normalized = re.sub(r'\s+', ' ', address.lower().strip())
        return normalized
    
    def analyze(self, current_voters: List[Dict], previous_voters: List[Dict]) -> Dict[str, Any]:
        """
        Analyze network patterns in voter data
        
        Args:
            current_voters: List of current voter records
            previous_voters: List of previous voter records
            
        Returns:
            Dict with network_score (0-100) and evidence
        """
        if not current_voters:
            return {
                'network_score': 0,
                'evidence': [],
                'details': 'No voter data to analyze'
            }
        
        # Build address clusters
        address_clusters = defaultdict(list)
        surname_address_clusters = defaultdict(list)
        
        for voter in current_voters:
            address = self._normalize_address(voter.get('address', ''))
            surname = self._extract_surname(voter.get('name', ''))
            voter_id = voter.get('voter_id')
            
            if address:
                address_clusters[address].append(voter_id)
            
            if address and surname:
                key = f"{surname}_{address}"
                surname_address_clusters[key].append(voter_id)
        
        # Analyze patterns
        island_nodes = 0  # Voters with no connections
        star_clusters = []  # Addresses with too many voters
        family_clusters = []  # Realistic family units
        
        # Check for island nodes (new voters with unique addresses and surnames)
        prev_lookup = {v['voter_id']: v for v in previous_voters} if previous_voters else {}
        
        for voter in current_voters:
            voter_id = voter.get('voter_id')
            address = self._normalize_address(voter.get('address', ''))
            surname = self._extract_surname(voter.get('name', ''))
            
            # New voter (not in previous roll)
            if voter_id not in prev_lookup:
                # Check if they have connections
                has_address_connection = len(address_clusters.get(address, [])) > 1
                has_family_connection = len(surname_address_clusters.get(f"{surname}_{address}", [])) > 1
                
                if not has_address_connection and not has_family_connection:
                    island_nodes += 1
        
        # Check for star clusters (too many voters at one address)
        REALISTIC_MAX_PER_ADDRESS = 8  # Typical max for a household
        
        for address, voters in address_clusters.items():
            cluster_size = len(voters)
            if cluster_size > REALISTIC_MAX_PER_ADDRESS:
                star_clusters.append({
                    'address': address[:50] + '...' if len(address) > 50 else address,
                    'voter_count': cluster_size
                })
            elif 2 <= cluster_size <= REALISTIC_MAX_PER_ADDRESS:
                family_clusters.append(cluster_size)
        
        # Calculate network score (0-100, higher = more anomalous)
        total_voters = len(current_voters)
        
        # Island node ratio (isolated voters are suspicious)
        island_ratio = island_nodes / total_voters if total_voters > 0 else 0
        island_score = min(100, island_ratio * 150)  # Scale to 0-100
        
        # Star cluster score (unrealistic concentrations)
        star_score = min(100, len(star_clusters) * 20)
        
        # Lack of family structure (if <30% of voters are in family units)
        family_ratio = len(family_clusters) / (len(address_clusters) or 1)
        family_score = max(0, (0.3 - family_ratio) * 200) if family_ratio < 0.3 else 0
        
        # Combined network score
        network_score = (island_score * 0.4) + (star_score * 0.4) + (family_score * 0.2)
        
        # Build evidence
        evidence = []
        
        if island_nodes > total_voters * 0.2:
            evidence.append(
                f"🏝️ **Network Isolation Alert**: {island_nodes} voters ({(island_ratio*100):.1f}%) show zero familial or residential connections to existing rolls"
            )
        
        if star_clusters:
            top_clusters = sorted(star_clusters, key=lambda x: x['voter_count'], reverse=True)[:3]
            cluster_desc = ', '.join([f"{c['voter_count']} at one address" for c in top_clusters])
            evidence.append(
                f"⭐ **Unrealistic Clusters**: {len(star_clusters)} addresses with excessive voter concentration ({cluster_desc})"
            )
        
        if family_ratio < 0.3:
            evidence.append(
                f"👨‍👩‍👧‍👦 **Weak Family Structure**: Only {(family_ratio*100):.1f}% of addresses show typical family patterns"
            )
        
        return {
            'network_score': round(network_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': total_voters,
                'island_nodes': island_nodes,
                'star_clusters': len(star_clusters),
                'family_clusters': len(family_clusters),
                'top_star_clusters': star_clusters[:5]
            }
        }
