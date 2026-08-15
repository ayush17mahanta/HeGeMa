from typing import List, Dict, Any

class FeatureVectorEngine:
    """
    Normalizes, sanitizes, and formats multi-sensor telemetry streams
    into unified input matrices for the AI Model Zoo.
    Supports Wi-Fi RSSI, BLE, Audio, IMU, Wi-Fi CSI, and Distance estimation.
    """
    FEATURE_NAMES = [
        "wifi_rssi_norm",
        "ble_rssi_norm",
        "audio_db_norm",
        "imu_vibration_norm",
        "csi_presence_norm",
        "distance_est_norm"
    ]

    @staticmethod
    def extract(raw_telemetry: Dict[str, Any]) -> List[float]:
        """Convert raw dict into normalized float list (with CSI support)."""
        wifi = raw_telemetry.get("wifi_rssi_norm", 0.0)
        ble = raw_telemetry.get("ble_rssi_norm", 0.0)
        audio = raw_telemetry.get("audio_db_norm", raw_telemetry.get("rms_energy_norm", 0.0))
        imu = raw_telemetry.get("imu_vibration_norm", raw_telemetry.get("accel_mag_norm", 0.0))
        csi = raw_telemetry.get("csi_presence_norm", 0.0)
        dist = raw_telemetry.get("distance_est_norm", 0.5)

        return [
            max(0.0, min(1.0, float(wifi))),
            max(0.0, min(1.0, float(ble))),
            max(0.0, min(1.0, float(audio))),
            max(0.0, min(1.0, float(imu))),
            max(0.0, min(1.0, float(csi))),
            max(0.0, min(1.0, float(dist)))
        ]
