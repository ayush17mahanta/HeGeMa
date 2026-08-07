from typing import Dict, Any

class AudioAdapter:
    """
    Audio Feature Adapter.
    Extracts RMS Energy, Zero Crossing Rate (ZCR), MFCC, and Spectral Centroid.
    """
    @staticmethod
    def extract_features(raw_data: Dict[str, Any]) -> Dict[str, float]:
        db = raw_data.get("audio_db_level", raw_data.get("rms_energy", 30.0))
        norm_rms = max(0.0, min(1.0, (float(db) - 30.0) / 60.0))
        zcr = raw_data.get("zero_crossing_rate", 0.25)
        mfcc = raw_data.get("mfcc_1", 0.50)
        spectral_centroid = raw_data.get("spectral_centroid", 0.40)
        return {
            "rms_energy_norm": round(norm_rms, 4),
            "zero_crossing_rate_norm": round(float(zcr), 4),
            "mfcc_1_norm": round(float(mfcc), 4),
            "spectral_centroid_norm": round(float(spectral_centroid), 4),
            "status": "AVAILABLE"
        }
