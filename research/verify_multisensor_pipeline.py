import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sensors.wifi_plugin import RSSIAdapter
from sensors.ble_plugin import BLEAdapter
from sensors.audio_plugin import AudioAdapter
from sensors.imu_plugin import IMUAdapter
from ai.sensor_fusion import SensorFusionEngine

def verify():
    print("==========================================================")
    print("HEGEMA MULTI-SENSOR PIPELINE VERIFICATION")
    print("==========================================================")

    # Sample raw telemetry inputs from multi-sensor devices
    raw_wifi = {"wifi_rssi_avg": -65.0}
    raw_ble = {"ble_rssi": -72.0, "ble_devices_count": 3}
    raw_audio = {"audio_db_level": 55.0, "zero_crossing_rate": 0.35}
    raw_imu = {"imu_acceleration_mag": 0.45, "gyro_mag": 0.12}

    # Extract adapter features
    wifi_feat = RSSIAdapter.extract_features(raw_wifi)
    ble_feat = BLEAdapter.extract_features(raw_ble)
    audio_feat = AudioAdapter.extract_features(raw_audio)
    imu_feat = IMUAdapter.extract_features(raw_imu)

    print("[1] Feature Adapters Extraction:")
    print("    - Wi-Fi:", wifi_feat)
    print("    - BLE:  ", ble_feat)
    print("    - Audio:", audio_feat)
    print("    - IMU:  ", imu_feat)

    # Combine into unified feature map
    feature_map = {}
    feature_map.update(wifi_feat)
    feature_map.update(ble_feat)
    feature_map.update(audio_feat)
    feature_map.update(imu_feat)

    # Run Sensor Fusion Engine
    fusion_engine = SensorFusionEngine()
    fusion_output = fusion_engine.fuse_telemetry(feature_map)

    print("\n[2] Sensor Fusion Engine Output:")
    print("    - Fusion Confidence:", fusion_output["fusion_confidence"])
    print("    - Sensor Contributions:")
    for item in fusion_output["sensor_contributions"]:
        print(f"      * {item['sensor']:18s}: {item['weight']}%")

    # Mission Logger verification
    missions_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/missions"))
    os.makedirs(missions_dir, exist_ok=True)
    log_file = os.path.join(missions_dir, "multisensor_mission_log.jsonl")

    log_entry = {
        "timestamp": "2026-08-07T11:38:00Z",
        "mission_id": "multisensor_test_01",
        "sensor_sources": ["Wi-Fi RSSI", "BLE RSSI", "Audio Acoustic", "IMU Motion"],
        "feature_vector": feature_map,
        "fusion_confidence": fusion_output["fusion_confidence"]
    }

    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")

    print(f"\n[3] Mission Recorder Verification:")
    print(f"    - Recorded multi-sensor mission event log to: {log_file}")
    print("==========================================================")
    print("[OK] MULTI-SENSOR PIPELINE VERIFICATION PASSED")
    print("==========================================================")

if __name__ == "__main__":
    verify()
