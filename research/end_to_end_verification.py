import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.model_zoo import ModelZoo
from ai.xai_engine import XAIEngine
from ai.feature_vector import FeatureVectorEngine

def main():
    print("==========================================================")
    print("HEGEMA END-TO-END SYSTEM VERIFICATION")
    print("==========================================================")

    # 1. Initialize Model Zoo
    zoo = ModelZoo()
    
    # 2. Input Sample RSSI Feature Vector (AP-A, AP-B, AP-C, AP-D signals)
    raw_telemetry = {
        "wifi_rssi_norm": 0.85,
        "ble_rssi_norm": 0.70,
        "audio_db_norm": 0.40,
        "imu_vibration_norm": 0.20,
        "distance_est_norm": 0.35
    }
    feature_vec = FeatureVectorEngine.extract(raw_telemetry)
    
    # 3. Model Prediction
    prediction = zoo.predict_occupancy(feature_vec)
    xai = XAIEngine.generate_attribution(feature_vec)

    print(f"\n[1] AI Model Zoo Status:")
    print(f"    - Active Model: {prediction['model_used']}")
    print(f"    - Top Predicted Zone: {prediction['predicted_zone']}")
    print(f"    - Prediction Confidence: {prediction['confidence']*100:.1f}%")
    print(f"    - Candidate Zones Distribution: {list(prediction['probability_distribution'].items())[:3]}")

    print(f"\n[2] Explainable AI (XAI) Attributions:")
    print(f"    - Summary: {xai['diagnostic_summary']}")
    for item in xai['active_model_inputs']:
        print(f"      * {item['sensor']:22s}: {item['percentage']}% ({item['status']})")
    print(f"    - Future Hardware Plugins:")
    for plugin in xai['future_plugins_ready']:
        print(f"      * {plugin['sensor']:25s}: {plugin['status']}")

    # 4. Log Event Verification
    missions_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/missions"))
    os.makedirs(missions_dir, exist_ok=True)
    test_log_file = os.path.join(missions_dir, "end_to_end_test_log.jsonl")
    
    log_entry = {
        "timestamp": "2026-08-07T11:31:00Z",
        "mission_id": "test_e2e_mission",
        "input_vector": feature_vec,
        "prediction": prediction['predicted_zone'],
        "confidence": prediction['confidence'],
        "model_used": prediction['model_used']
    }
    
    with open(test_log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry) + "\n")

    print(f"\n[3] Mission Event Logging:")
    print(f"    - Successfully wrote event log to: {test_log_file}")
    print("==========================================================")
    print("[OK] END-TO-END VERIFICATION COMPLETED SUCCESSFULLY")
    print("==========================================================")

if __name__ == "__main__":
    main()
