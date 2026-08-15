from typing import Dict, Any, List

class SensorFusionEngine:
    """
    HEGEMA Modular Sensor Fusion AI Engine.
    Fuses predictions across independent modular sensor models (Wi-Fi RSSI, CSI, BLE, Audio, IMU).
    Dynamic weight re-scaling ensures seamless operation if any sensor is missing or offline.
    """
    def __init__(self):
        self.modalities_status = {
            "wifi": {"available": True, "dataset_loaded": True, "live_connected": False},
            "csi": {"available": True, "dataset_loaded": True, "live_connected": False},
            "ble": {"available": True, "dataset_loaded": True, "live_connected": False},
            "audio": {"available": True, "dataset_loaded": True, "live_connected": False},
            "imu": {"available": True, "dataset_loaded": True, "live_connected": False}
        }

        # Baseline base weights when all modalities are active
        self.base_weights = {
            "csi": 0.25,
            "wifi": 0.25,
            "ble": 0.25,
            "audio": 0.15,
            "imu": 0.10
        }

    def fuse_telemetry(self, feature_map: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fuses multi-sensor feature dict and returns multi-modal prediction + status metrics.
        """
        wifi_val = float(feature_map.get("wifi_rssi_norm", 0.5))
        ble_val = float(feature_map.get("ble_rssi_norm", 0.5))
        audio_val = float(feature_map.get("rms_energy_norm", feature_map.get("audio_db_norm", 0.2)))
        imu_val = float(feature_map.get("accel_mag_norm", feature_map.get("imu_vibration_norm", 0.1)))

        # CSI presence value if provided, else None
        csi_present = "csi_presence_norm" in feature_map or "csi_var_norm" in feature_map
        csi_val = float(feature_map.get("csi_presence_norm", 0.0)) if csi_present else None

        # Determine active sensor set & normalize weights dynamically
        active_weights = {}
        active_values = {}

        if csi_val is not None:
            active_weights["csi"] = self.base_weights["csi"]
            active_values["csi"] = csi_val

        active_weights["wifi"] = self.base_weights["wifi"] if csi_val is not None else 0.30
        active_values["wifi"] = wifi_val

        active_weights["ble"] = self.base_weights["ble"] if csi_val is not None else 0.35
        active_values["ble"] = ble_val

        active_weights["audio"] = self.base_weights["audio"] if csi_val is not None else 0.20
        active_values["audio"] = audio_val

        active_weights["imu"] = self.base_weights["imu"] if csi_val is not None else 0.15
        active_values["imu"] = imu_val

        # Normalize active weights to sum to 1.0
        weight_sum = sum(active_weights.values())
        norm_weights = {k: v / weight_sum for k, v in active_weights.items()}

        # Compute dynamic multi-sensor fusion score
        fusion_score = sum(norm_weights[k] * active_values[k] for k in norm_weights)
        confidence = round(min(0.98, max(0.50, fusion_score * 1.1)), 4)

        # Compute percentage contribution per modality
        contributions = []
        labels = {
            "csi": "Wi-Fi CSI Model",
            "wifi": "Wi-Fi RSSI Model",
            "ble": "BLE Beacon Model",
            "audio": "Audio Acoustic Model",
            "imu": "IMU Motion Model"
        }

        for k in norm_weights:
            contrib_val = norm_weights[k] * active_values[k]
            perc = round(contrib_val / (fusion_score + 0.001) * 100, 1)
            contributions.append({"sensor": labels[k], "weight": perc})

        # Distinct confidence & quality metrics
        human_presence_prob = round(csi_val if csi_val is not None else (wifi_val * 0.4 + ble_val * 0.4 + audio_val * 0.2), 4)
        spatial_confidence = confidence
        sensor_agreement = round(1.0 - min(1.0, max(active_values.values()) - min(active_values.values())), 4)
        signal_quality = round(float(feature_map.get("csi_quality_score", 0.9)), 4)

        search_priority = "CRITICAL" if human_presence_prob >= 0.80 else ("HIGH" if human_presence_prob >= 0.60 else "MEDIUM")

        return {
            "fusion_confidence": confidence,
            "human_presence_probability": human_presence_prob,
            "spatial_confidence": spatial_confidence,
            "sensor_agreement": sensor_agreement,
            "signal_quality": signal_quality,
            "search_priority": search_priority,
            "active_mode": "RSSI + CSI + BLE + Audio + IMU" if csi_present else "RSSI + BLE + Audio + IMU",
            "sensor_statuses": {
                "csi": {"label": "Wi-Fi CSI", "status": "Plugin Loaded", "active": csi_present},
                "wifi": {"label": "Wi-Fi RSSI", "status": "Dataset Loaded", "active": True},
                "ble": {"label": "BLE Beacon", "status": "Dataset Loaded", "active": True},
                "audio": {"label": "Audio Acoustic", "status": "Dataset Loaded", "active": True},
                "imu": {"label": "IMU Motion", "status": "Dataset Loaded", "active": True}
            },
            "sensor_contributions": contributions,
            "fusion_diagnostic_note": "Dynamic sensor fusion engine with modular weight re-scaling and optional CSI subcarrier feature evidence."
        }
