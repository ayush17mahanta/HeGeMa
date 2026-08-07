from typing import Dict, Any

class BLEAdapter:
    """
    Bluetooth Low Energy (BLE) Feature Adapter.
    Converts raw BLE RSSI and beacon count into normalized FeatureVector inputs.
    """
    @staticmethod
    def extract_features(raw_data: Dict[str, Any]) -> Dict[str, float]:
        rssi = raw_data.get("ble_rssi", raw_data.get("ble_beacon_rssi", -100.0))
        norm_rssi = max(0.0, min(1.0, (float(rssi) + 100.0) / 70.0))
        count = raw_data.get("ble_devices_count", 1)
        norm_count = min(1.0, float(count) / 10.0)
        return {
            "ble_rssi_norm": round(norm_rssi, 4),
            "ble_count_norm": round(norm_count, 4),
            "status": "AVAILABLE"
        }
