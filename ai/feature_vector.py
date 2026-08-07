from typing import List, Dict, Any

class FeatureVectorEngine:
    """
    Normalizes, sanitizes, and formats multi-sensor telemetry streams
    into unified input matrices for the AI Model Zoo.
    """
    FEATURE_NAMES = [
        "wifi_rssi_norm",
        "ble_rssi_norm",
        "audio_db_norm",
        "imu_vibration_norm",
        "distance_est_norm"
    ]

    @staticmethod
    def extract(raw_telemetry: Dict[str, Any]) -> List[float]:
        """Convert raw dict into 5-dimensional normalized float list."""
        wifi = raw_telemetry.get("wifi_rssi_norm", 0.0)
        ble = raw_telemetry.get("ble_rssi_norm", 0.0)
        audio = raw_telemetry.get("audio_db_norm", 0.0)
        imu = raw_telemetry.get("imu_vibration_norm", 0.0)
        dist = raw_telemetry.get("distance_est_norm", 0.5)

        return [
            max(0.0, min(1.0, float(wifi))),
            max(0.0, min(1.0, float(ble))),
            max(0.0, min(1.0, float(audio))),
            max(0.0, min(1.0, float(imu))),
            max(0.0, min(1.0, float(dist)))
        ]
