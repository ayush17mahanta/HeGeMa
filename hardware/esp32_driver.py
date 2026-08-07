from typing import Dict, Any, List
from .base_driver import HALBaseDriver

class ESP32HALDriver(HALBaseDriver):
    """
    HAL Driver for ESP32 Nodes sending Wi-Fi RSSI and BLE Beacon telemetry.
    """
    def __init__(self, node_id: str):
        super().__init__(node_id, node_type="esp32")

    async def connect(self) -> bool:
        # ESP32 connects asynchronously via MQTT broker
        return True

    async def read_raw_telemetry(self) -> Dict[str, Any]:
        return {
            "node_id": self.node_id,
            "wifi_rssi_avg": -65.0,
            "ble_devices_count": 2,
            "battery_voltage": 4.10
        }

    def normalize_feature_vector(self, raw_data: Dict[str, Any]) -> List[float]:
        # Maps RSSI [-100 dBm, -30 dBm] -> [0.0, 1.0]
        rssi = raw_data.get("wifi_rssi_avg", -100.0)
        norm_rssi = max(0.0, min(1.0, (rssi + 100.0) / 70.0))
        
        ble_count = raw_data.get("ble_devices_count", 0)
        norm_ble = min(1.0, ble_count / 5.0)

        # ESP32 nodes have no mic/IMU -> defaults to 0.0
        return [norm_rssi, norm_ble, 0.0, 0.0, 0.5]
