from typing import Dict, Any, List

class RSSIAdapter:
    """
    Wi-Fi RSSI Feature Adapter.
    Converts raw Wi-Fi RSSI signal reads into normalized FeatureVector inputs.
    """
    @staticmethod
    def extract_features(raw_data: Dict[str, Any]) -> Dict[str, float]:
        rssi = raw_data.get("wifi_rssi_avg", raw_data.get("signal", -100.0))
        norm_rssi = max(0.0, min(1.0, (float(rssi) + 100.0) / 70.0))
        return {
            "wifi_rssi_norm": round(norm_sig if 'norm_sig' in locals() else norm_rssi, 4),
            "status": "AVAILABLE"
        }
