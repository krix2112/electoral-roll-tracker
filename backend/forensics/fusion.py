"""
Module D: Multi-Signal Fusion & Scoring Engine
Combines all detection modules into a single comprehensive anomaly score
"""

from typing import List, Dict, Any
from .behavioral import BehavioralFingerprintEngine
from .network import NetworkAnalysisEngine
from .entropy import EntropyAnalysisEngine


class MultiSignalFusionEngine:
    """
    Core fusion engine that combines multiple detection signals
    into a single, weighted anomaly score.
    """
    
    def __init__(self):
        self.name = "Multi-Signal Fusion"
        
        # Initialize all detection modules
        self.behavioral_engine = BehavioralFingerprintEngine()
        self.network_engine = NetworkAnalysisEngine()
        self.entropy_engine = EntropyAnalysisEngine()
        
        # Weights for fusion (must sum to 1.0)
        self.weights = {
            'behavioral': 0.25,
            'network': 0.35,
            'entropy': 0.25,
            'other': 0.15  # Reserved for future modules
        }
    
    def analyze(self, current_voters: List[Dict], previous_voters: List[Dict] = None) -> Dict[str, Any]:
        """
        Run all detection modules and fuse results
        
        Args:
            current_voters: List of current voter records
            previous_voters: Optional list of previous voter records
            
        Returns:
            Comprehensive analysis with final_anomaly_score and module breakdowns
        """
        if not current_voters:
            return {
                'final_anomaly_score': 0,
                'verdict': 'No Data',
                'confidence_level': 'Low',
                'module_breakdowns': [],
                'all_evidence': [],
                'summary': 'Insufficient data for analysis'
            }
        
        # Run all detection modules
        behavioral_result = self.behavioral_engine.analyze(current_voters, previous_voters or [])
        network_result = self.network_engine.analyze(current_voters, previous_voters or [])
        entropy_result = self.entropy_engine.analyze(current_voters, previous_voters or [])
        
        # Extract individual scores
        behavior_score = behavioral_result.get('behavior_score', 0)
        network_score = network_result.get('network_score', 0)
        entropy_score = entropy_result.get('entropy_score', 0)
        
        # Calculate weighted fusion score
        final_anomaly_score = (
            (behavior_score * self.weights['behavioral']) +
            (network_score * self.weights['network']) +
            (entropy_score * self.weights['entropy']) +
            (0 * self.weights['other'])  # Placeholder for future modules
        )
        
        # Determine verdict based on score
        verdict, verdict_color = self._get_verdict(final_anomaly_score)
        
        # Determine confidence level
        confidence_level = self._calculate_confidence(
            behavior_score, network_score, entropy_score
        )
        
        # Collect all evidence
        all_evidence = []
        all_evidence.extend(behavioral_result.get('evidence', []))
        all_evidence.extend(network_result.get('evidence', []))
        all_evidence.extend(entropy_result.get('evidence', []))
        
        # Build module breakdowns
        module_breakdowns = [
            {
                'module': 'Behavioral Fingerprinting',
                'score': round(behavior_score, 2),
                'weight': self.weights['behavioral'],
                'contribution': round(behavior_score * self.weights['behavioral'], 2),
                'evidence': behavioral_result.get('evidence', []),
                'details': behavioral_result.get('details', {})
            },
            {
                'module': 'Network Analysis',
                'score': round(network_score, 2),
                'weight': self.weights['network'],
                'contribution': round(network_score * self.weights['network'], 2),
                'evidence': network_result.get('evidence', []),
                'details': network_result.get('details', {})
            },
            {
                'module': 'Entropy Analysis',
                'score': round(entropy_score, 2),
                'weight': self.weights['entropy'],
                'contribution': round(entropy_score * self.weights['entropy'], 2),
                'evidence': entropy_result.get('evidence', []),
                'details': entropy_result.get('details', {})
            }
        ]
        
        # Generate summary
        summary = self._generate_summary(
            final_anomaly_score, verdict, len(all_evidence), module_breakdowns
        )
        
        return {
            'final_anomaly_score': round(final_anomaly_score, 2),
            'verdict': verdict,
            'verdict_color': verdict_color,
            'confidence_level': confidence_level,
            'module_breakdowns': module_breakdowns,
            'all_evidence': all_evidence,
            'summary': summary,
            'weights': self.weights
        }
    
    def _get_verdict(self, score: float) -> tuple:
        """Determine verdict and color based on score"""
        if score >= 70:
            return ('Critical Anomaly', 'red')
        elif score >= 30:
            return ('Moderate Concern', 'yellow')
        else:
            return ('Normal Pattern', 'green')
    
    def _calculate_confidence(self, behavior_score: float, network_score: float, entropy_score: float) -> str:
        """
        Calculate confidence level based on score agreement
        High confidence = all modules agree (all high or all low)
        """
        scores = [behavior_score, network_score, entropy_score]
        avg_score = sum(scores) / len(scores)
        
        # Calculate variance
        variance = sum((s - avg_score) ** 2 for s in scores) / len(scores)
        std_dev = variance ** 0.5
        
        # Low variance = high confidence (modules agree)
        if std_dev < 15:
            return 'High'
        elif std_dev < 30:
            return 'Medium'
        else:
            return 'Low'
    
    def _generate_summary(self, score: float, verdict: str, evidence_count: int, modules: List[Dict]) -> str:
        """Generate human-readable summary"""
        if score >= 70:
            top_module = max(modules, key=lambda m: m['score'])
            return (
                f"🚨 Critical forensic analysis detected {evidence_count} anomaly indicators. "
                f"Primary concern: {top_module['module']} flagged severe irregularities. "
                f"Immediate investigation recommended."
            )
        elif score >= 30:
            return (
                f"⚠️ Moderate anomalies detected across {evidence_count} indicators. "
                f"Pattern suggests potential irregularities requiring further review."
            )
        else:
            return (
                f"✅ Voter data shows normal patterns with minimal anomalies. "
                f"No immediate concerns detected."
            )
