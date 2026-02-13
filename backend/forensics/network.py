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
    
    def analyze(self, current_df: Any, previous_df: Any = None) -> Dict[str, Any]:
        """
        Analyze network patterns using DataFrames
        
        Args:
            current_df: DataFrame of current voter records
            previous_df: Optional DataFrame of previous voter records
            
        Returns:
            Dict with network_score (0-100) and evidence
        """
        if current_df is None or current_df.empty:
            return {'network_score': 0, 'evidence': [], 'details': 'No voter data'}
        
        total_voters = len(current_df)
        
        # Normalize addresses (vectorized)
        current_df['norm_addr'] = current_df['address'].str.lower().str.strip().str.replace(r'\s+', ' ', regex=True)
        current_df['surname'] = current_df['name'].str.strip().str.split().str[-1]
        
        # 1. IDENTIFY STAR CLUSTERS (High voter concentration per address)
        addr_counts = current_df['norm_addr'].value_counts()
        REALISTIC_MAX_PER_ADDRESS = 8
        star_clusters_mask = addr_counts > REALISTIC_MAX_PER_ADDRESS
        star_clusters = addr_counts[star_clusters_mask]
        
        # 2. IDENTIFY ISLAND NODES (Isolated new voters)
        # A voter is isolated if they are NEW and have NO shared address/surname connections
        if previous_df is not None and not previous_df.empty:
            prev_ids = set(previous_df['voter_id'])
            new_voters = current_df[~current_df['voter_id'].isin(prev_ids)]
        else:
            new_voters = current_df
            
        # Check for connections (find how many people at same address or same surname+address)
        # Use transform to get counts back to the original index
        addr_conn_counts = current_df.groupby('norm_addr')['voter_id'].transform('count')
        family_conn_counts = current_df.groupby(['norm_addr', 'surname'])['voter_id'].transform('count')
        
        current_df['has_connection'] = (addr_conn_counts > 1) | (family_conn_counts > 1)
        
        # Island nodes: new voters who have no connection
        # Use re-indexed series to avoid Alignment issues
        island_nodes_mask = (~current_df['voter_id'].isin(prev_ids if previous_df is not None else [])) & (~current_df['has_connection'])
        island_nodes_count = island_nodes_mask.sum()
        
        # 3. FAMILY STRUCTURE
        family_ratio = (addr_conn_counts >= 2).sum() / total_voters
        
        # SCORE CALCULATION
        island_ratio = island_nodes_count / total_voters
        island_score = min(100, island_ratio * 150)
        star_score = min(100, len(star_clusters) * 20)
        family_score = max(0, (0.3 - family_ratio) * 200) if family_ratio < 0.3 else 0
        
        network_score = (island_score * 0.4) + (star_score * 0.4) + (family_score * 0.2)
        
        # EVIDENCE
        evidence = []
        if island_nodes_count > total_voters * 0.2:
            evidence.append(f"🏝️ **Network Isolation Alert**: {island_nodes_count} voters ({(island_ratio*100):.1f}%) show zero connections")
        
        if not star_clusters.empty:
            top_3 = star_clusters.head(3)
            desc = ', '.join([f"{count} at one address" for count in top_3])
            evidence.append(f"⭐ **Unrealistic Clusters**: {len(star_clusters)} addresses with excessive concentration ({desc})")
            
        if family_ratio < 0.3:
            evidence.append(f"👨‍👩‍👧‍👦 **Weak Family Structure**: Only {(family_ratio*100):.1f}% of voters show typical family patterns")
            
        return {
            'network_score': round(network_score, 2),
            'evidence': evidence,
            'details': {
                'total_voters': total_voters,
                'island_nodes': int(island_nodes_count),
                'star_clusters': len(star_clusters),
                'family_ratio': round(family_ratio, 3)
            }
        }
