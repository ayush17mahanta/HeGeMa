"""
HEGEMA Wi-Fi CSI Sensor Adapter Plugin
Converts CSIFeatureVector into normalized feature dictionary for HEGEMA SensorFusionEngine.
"""

from typing import Dict, Any, Optional
from sensors.csi.csi_types import CSIFeatureVector


class CSIAdapter:
    """Standard HEGEMA Sensor Adapter for Wi-Fi Channel State Information."""

    def __init__(self):
        self.modality_name = "csi"

    def normalize(self, feature_vector: CSIFeatureVector) -> Dict[str, float]:
        """
        Normalizes raw feature vector values into standardized [0.0, 1.0] bounds.
        """
        # Clamp & scale normalized CSI metrics
        csi_amp_norm = min(1.0, max(0.0, feature_vector.amplitude_mean / 40.0))
        csi_var_norm = min(1.0, max(0.0, feature_vector.temporal_variance / 15.0))
        csi_std_norm = min(1.0, max(0.0, feature_vector.amplitude_std / 5.0))
        csi_doppler_norm = min(1.0, max(0.0, feature_vector.doppler_proxy / 4.0))
        csi_entropy_norm = min(1.0, max(0.0, feature_vector.amplitude_entropy / 3.32))  # log2(10) max entropy

        # Combine into human presence indicator proxy
        presence_indicator = min(1.0, max(0.0, (csi_var_norm * 0.4) + (csi_doppler_norm * 0.4) + (csi_entropy_norm * 0.2)))

        return {
            "csi_amp_norm": round(csi_amp_norm, 4),
            "csi_var_norm": round(csi_var_norm, 4),
            "csi_std_norm": round(csi_std_norm, 4),
            "csi_doppler_norm": round(csi_doppler_norm, 4),
            "csi_entropy_norm": round(csi_entropy_norm, 4),
            "csi_presence_norm": round(presence_indicator, 4),
            "csi_quality_score": round(feature_vector.quality_score, 4),
        }

    def evaluate_quality(self, feature_vector: CSIFeatureVector) -> float:
        """Evaluates signal quality based on packet rate and subcarrier noise."""
        rate_score = min(1.0, feature_vector.packet_rate / 50.0)
        q = (rate_score * 0.5) + (feature_vector.quality_score * 0.5)
        return min(1.0, max(0.0, q))
