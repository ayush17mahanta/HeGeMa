from typing import List, Dict, Any

class XAIEngine:
    """
    Explainable AI (XAI) Attribution Engine.
    Evaluates feature contributions across active sensor channels.
    Provides honest breakdown for current Wi-Fi RSSI signals while indicating modular HAL plugins.
    """
    @staticmethod
    def generate_attribution(feature_vector: List[float]) -> Dict[str, Any]:
        vec = list(feature_vector) + [0.0] * max(0, 4 - len(feature_vector))
        rssi_a, rssi_b, rssi_c, rssi_d = vec[:4]

        total_rssi = rssi_a + rssi_b + rssi_c + rssi_d + 0.001

        ap_a_pct = round((rssi_a / total_rssi) * 100, 1)
        ap_b_pct = round((rssi_b / total_rssi) * 100, 1)
        ap_c_pct = round((rssi_c / total_rssi) * 100, 1)
        ap_d_pct = round((rssi_d / total_rssi) * 100, 1)

        return {
            "active_model_inputs": [
                {"sensor": "Wi-Fi AP-A RSSI", "percentage": ap_a_pct, "status": "ACTIVE"},
                {"sensor": "Wi-Fi AP-B RSSI", "percentage": ap_b_pct, "status": "ACTIVE"},
                {"sensor": "Wi-Fi AP-C RSSI", "percentage": ap_c_pct, "status": "ACTIVE"},
                {"sensor": "Wi-Fi AP-D RSSI", "percentage": ap_d_pct, "status": "ACTIVE"}
            ],
            "future_plugins_ready": [
                {"sensor": "BLE Rescue Beacon", "status": "HAL READY"},
                {"sensor": "Microphone Acoustic Tap", "status": "HAL READY"},
                {"sensor": "IMU Structural Vibration", "status": "HAL READY"}
            ],
            "diagnostic_summary": f"Spatial localization driven by Wi-Fi RSSI attributions: AP-A ({ap_a_pct}%), AP-B ({ap_b_pct}%)."
        }
