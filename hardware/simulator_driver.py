import random
from typing import Dict, Any, List
from .base_driver import HALBaseDriver

class SimulatorHALDriver(HALBaseDriver):
    """
    HAL Driver for Synthetic Disaster Scenario Simulator Nodes.
    Injects dynamic survivor movements and sensor noise.
    """
    def __init__(self, node_id: str):
        super().__init__(node_id, node_type="simulator")

    async def connect(self) -> bool:
        return True

    async def read_raw_telemetry(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "simulated_wifi_rssi": -55.0 + random.uniform(-5, 5),
            "simulated_ble_rssi": -62.0 + random.uniform(-4, 4),
            "simulated_audio_db": 65.0 if random.random() > 0.7 else 35.0,
            "simulated_imu_mag": 0.4 if random.random() > 0.6 else 0.05
        }

    def normalize_feature_vector(self, raw_data: Dict[str, Any]) -> List[float]:
        wifi_rssi = raw_data.get("simulated_wifi_rssi", -100.0)
        norm_wifi = max(0.0, min(1.0, (wifi_rssi + 100.0) / 70.0))

        ble_rssi = raw_data.get("simulated_ble_rssi", -100.0)
        norm_ble = max(0.0, min(1.0, (ble_rssi + 100.0) / 70.0))

        audio_db = raw_data.get("simulated_audio_db", 30.0)
        norm_audio = max(0.0, min(1.0, (audio_db - 30.0) / 60.0))

        imu_mag = raw_data.get("simulated_imu_mag", 0.0)
        norm_imu = min(1.0, imu_mag / 5.0)

        return [norm_wifi, norm_ble, norm_audio, norm_imu, 0.3]
