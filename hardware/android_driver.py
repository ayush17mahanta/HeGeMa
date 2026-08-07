from typing import Dict, Any, List
from .base_driver import HALBaseDriver

class AndroidHALDriver(HALBaseDriver):
    """
    HAL Driver for Android Field Smartphones collecting mic audio dB & IMU motion.
    """
    def __init__(self, node_id: str):
        super().__init__(node_id, node_type="android")

    async def connect(self) -> bool:
        return True

    async def read_raw_telemetry(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "ble_beacon_rssi": -72.0,
            "audio_db_level": 52.0,
            "imu_acceleration_mag": 0.15
        }

    def normalize_feature_vector(self, raw_data: Dict[str, Any]) -> List[float]:
        ble_rssi = raw_data.get("ble_beacon_rssi", -100.0)
        norm_ble = max(0.0, min(1.0, (ble_rssi + 100.0) / 70.0))

        # Audio dB [30 dB, 90 dB] -> [0.0, 1.0]
        audio_db = raw_data.get("audio_db_level", 30.0)
        norm_audio = max(0.0, min(1.0, (audio_db - 30.0) / 60.0))

        # IMU Acceleration [0 m/s^2, 5 m/s^2] -> [0.0, 1.0]
        imu_mag = raw_data.get("imu_acceleration_mag", 0.0)
        norm_imu = min(1.0, imu_mag / 5.0)

        return [0.0, norm_ble, norm_audio, norm_imu, 0.4]
