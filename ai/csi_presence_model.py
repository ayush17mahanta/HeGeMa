"""
HEGEMA Experimental CSI Human Presence Model
Predicts human presence probability (0.0 to 1.0) and confidence score from CSI feature vectors.
Distinguishes between NO_HUMAN_EVIDENCE, POSSIBLE_PRESENCE, STRONG_PRESENCE, and INSUFFICIENT_SIGNAL_QUALITY.
"""

from typing import Dict, Any, Tuple
from sensors.csi.csi_types import CSIFeatureVector


class CSIPresenceModel:
    """Experimental human-presence probability estimator."""

    def __init__(self):
        self.model_status = "EXPERIMENTAL / BASELINE_RULES"

    def predict_presence(self, feature: CSIFeatureVector) -> Dict[str, Any]:
        """
        Estimates human presence probability and confidence from CSIFeatureVector.
        """
        # Low signal quality check
        if feature.quality_score < 0.20:
            return {
                "human_presence_probability": 0.0,
                "confidence": round(feature.quality_score, 4),
                "presence_class": "INSUFFICIENT_SIGNAL_QUALITY",
                "explanation": "CSI packet rate or subcarrier quality score is too low for reliable inference."
            }

        # Human presence evidence proxies: temporal variance, doppler proxy, amplitude entropy
        var_norm = min(1.0, max(0.0, feature.temporal_variance / 12.0))
        doppler_norm = min(1.0, max(0.0, feature.doppler_proxy / 3.5))
        entropy_norm = min(1.0, max(0.0, feature.amplitude_entropy / 3.32))

        # Combined human presence score
        prob = (var_norm * 0.45) + (doppler_norm * 0.45) + (entropy_norm * 0.10)
        prob = min(1.0, max(0.0, prob))

        # Confidence bounded by quality and packet rate
        conf = min(0.95, max(0.40, (feature.quality_score * 0.6) + (prob * 0.4)))

        # Categorize evidence class
        if prob >= 0.75:
            presence_class = "STRONG_PRESENCE"
            desc = "High subcarrier variance and doppler fluctuation indicating strong human presence evidence."
        elif prob >= 0.40:
            presence_class = "POSSIBLE_PRESENCE"
            desc = "Moderate subcarrier disturbance indicating possible human movement or environmental change."
        else:
            presence_class = "NO_HUMAN_EVIDENCE"
            desc = "Subcarrier amplitudes are stable with baseline noise level."

        return {
            "human_presence_probability": round(prob, 4),
            "confidence": round(conf, 4),
            "presence_class": presence_class,
            "explanation": desc,
            "subcarrier_metrics": {
                "amplitude_std": round(feature.amplitude_std, 4),
                "temporal_variance": round(feature.temporal_variance, 4),
                "doppler_proxy": round(feature.doppler_proxy, 4),
                "amplitude_entropy": round(feature.amplitude_entropy, 4)
            }
        }
