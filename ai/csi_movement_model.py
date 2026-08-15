"""
HEGEMA Experimental CSI Movement Classifier
Classifies human movement states (STATIC, WALKING, MOVING, UNKNOWN) from CSI temporal Doppler features.
Explicitly labeled EXPERIMENTAL / UNTRAINED baseline detector.
"""

from typing import Dict, Any
from sensors.csi.csi_types import CSIFeatureVector


class CSIMovementClassifier:
    """Experimental movement classifier for CSI temporal feature streams."""

    def __init__(self):
        self.model_label = "EXPERIMENTAL / UNTRAINED_BASELINE"

    def classify_movement(self, feature: CSIFeatureVector) -> Dict[str, Any]:
        """
        Classifies movement state from Doppler proxy and temporal variance.
        """
        if feature.quality_score < 0.20:
            return {
                "movement_state": "UNKNOWN",
                "confidence": 0.0,
                "model_status": self.model_label
            }

        doppler = feature.doppler_proxy
        var = feature.temporal_variance

        if doppler > 2.5 or var > 8.0:
            state = "MOVING"
            conf = min(0.90, 0.50 + doppler * 0.1)
        elif doppler > 1.0 or var > 3.0:
            state = "WALKING"
            conf = min(0.85, 0.50 + doppler * 0.15)
        elif var < 1.0 and doppler < 0.5:
            state = "STATIC"
            conf = min(0.90, 0.60 + (1.0 - var) * 0.3)
        else:
            state = "UNKNOWN"
            conf = 0.50

        return {
            "movement_state": state,
            "confidence": round(conf, 4),
            "doppler_proxy": round(doppler, 4),
            "temporal_variance": round(var, 4),
            "model_status": self.model_label
        }
