from abc import ABC, abstractmethod
from typing import Dict, Any, List

class HALBaseDriver(ABC):
    """
    Hardware Abstraction Layer (HAL) Base Interface.
    Decouples raw sensor protocols (ESP32 MQTT, Android JSON, Simulator)
    from the downstream AI Feature Vector Engine.
    """
    def __init__(self, node_id: str, node_type: str):
        self.node_id = node_id
        self.node_type = node_type

    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection or initialize driver channel."""
        pass

    @abstractmethod
    async def read_raw_telemetry(self) -> Dict[str, Any]:
        """Read raw telemetry frame from physical hardware or simulated stream."""
        pass

    @abstractmethod
    def normalize_feature_vector(self, raw_data: Dict[str, Any]) -> List[float]:
        """
        Normalize raw sensor telemetry into standardized Feature Vector:
        [wifi_rssi_norm, ble_rssi_norm, audio_db_norm, imu_mag_norm, distance_est_norm]
        Values bounded in range [0.0, 1.0].
        """
        pass
