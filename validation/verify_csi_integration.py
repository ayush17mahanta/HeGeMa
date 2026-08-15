"""
HEGEMA Complete 12-Point Wi-Fi CSI Integration Verification Suite
Tests all modules: CSI types, preprocessor, feature extraction, adapter, ring buffer,
presence model, movement classifier, simulator, sensor fusion, feature vector, and data lake.
"""

import sys
import os
import json
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sensors.csi.csi_types import CSIObservation
from sensors.csi.csi_preprocessor import CSIPreprocessor
from sensors.csi.csi_features import CSIFeatureExtractor
from sensors.csi.csi_adapter import CSIAdapter
from sensors.csi.csi_buffer import CSIRingBuffer
from sensors.csi.csi_transport import CSITransportParser
from ai.csi_presence_model import CSIPresenceModel
from ai.csi_movement_model import CSIMovementClassifier
from ai.sensor_fusion import SensorFusionEngine
from ai.feature_vector import FeatureVectorEngine
from simulation.csi_simulator import CSISimulator


def run_csi_verification_suite():
    print("==========================================================")
    print("HEGEMA COMPLETE 12-POINT WI-FI CSI INTEGRATION VERIFICATION")
    print("==========================================================")

    results = []

    # Test 1: CSI Transport Parser
    try:
        raw_json = json.dumps({
            "node_id": "esp32-csi-test",
            "rssi": -60,
            "subcarrier_amplitudes": [10.5, 12.0, 14.5, 13.0, 11.2],
            "subcarrier_phases": [0.1, 0.2, 0.3, 0.4, 0.5]
        })
        obs = CSITransportParser.parse_payload(raw_json)
        assert obs is not None and obs.node_id == "esp32-csi-test"
        results.append(("1. CSI Transport Parser", "PASS"))
    except Exception as e:
        results.append(("1. CSI Transport Parser", f"FAIL: {e}"))

    # Test 2: ESP32 first_word_invalid Byte Masking
    try:
        quirk_obs = CSIObservation(
            timestamp="2026-08-12T12:00:00Z",
            node_id="esp32-csi-quirk",
            subcarrier_amplitudes=[0.0, 0.0, 0.0, 0.0, 15.0, 15.5, 14.8, 15.2],
            subcarrier_phases=[0.0] * 8,
            first_word_invalid=True
        )
        preprocessor = CSIPreprocessor()
        clean_amps, _ = preprocessor.preprocess_observation(quirk_obs)
        assert clean_amps[0] > 0.0  # Invalid bytes masked with median
        results.append(("2. ESP32 Byte Masking", "PASS"))
    except Exception as e:
        results.append(("2. ESP32 Byte Masking", f"FAIL: {e}"))

    # Test 3: Hampel Outlier Filter
    try:
        data_with_outlier = [10.0, 10.2, 10.1, 95.0, 10.3, 10.0]
        filtered = preprocessor._hampel_filter(data_with_outlier)
        assert filtered[3] < 50.0  # Outlier removed
        results.append(("3. Hampel Outlier Filter", "PASS"))
    except Exception as e:
        results.append(("3. Hampel Outlier Filter", f"FAIL: {e}"))

    # Test 4: Linear Phase Sanitization
    try:
        raw_phases = [0.1, 0.2, 0.3, 0.4, 0.5]
        sanitized = preprocessor._sanitize_phase(raw_phases)
        assert len(sanitized) == 5
        results.append(("4. Phase Sanitization", "PASS"))
    except Exception as e:
        results.append(("4. Phase Sanitization", f"FAIL: {e}"))

    # Test 5: CSI Feature Extraction
    try:
        simulator = CSISimulator()
        window = [CSITransportParser.parse_payload(simulator.generate_packet("moving_survivor")) for _ in range(10)]
        extractor = CSIFeatureExtractor(preprocessor)
        features = extractor.extract_features(window)
        assert features.amplitude_mean > 0.0
        assert features.doppler_proxy >= 0.0
        results.append(("5. CSI Feature Extraction", "PASS"))
    except Exception as e:
        results.append(("5. CSI Feature Extraction", f"FAIL: {e}"))

    # Test 6: CSI Adapter Normalization
    try:
        adapter = CSIAdapter()
        norm_dict = adapter.normalize(features)
        assert 0.0 <= norm_dict["csi_presence_norm"] <= 1.0
        results.append(("6. CSI Adapter Normalization", "PASS"))
    except Exception as e:
        results.append(("6. CSI Adapter Normalization", f"FAIL: {e}"))

    # Test 7: Ring Buffer Thread Safety
    try:
        buffer = CSIRingBuffer(capacity=50)
        for w in window:
            buffer.add(w)
        assert len(buffer) == 10
        results.append(("7. Ring Buffer Operations", "PASS"))
    except Exception as e:
        results.append(("7. Ring Buffer Operations", f"FAIL: {e}"))

    # Test 8: Human Presence Model Prediction
    try:
        presence_model = CSIPresenceModel()
        p_res = presence_model.predict_presence(features)
        assert 0.0 <= p_res["human_presence_probability"] <= 1.0
        assert p_res["presence_class"] in ["STRONG_PRESENCE", "POSSIBLE_PRESENCE", "NO_HUMAN_EVIDENCE", "INSUFFICIENT_SIGNAL_QUALITY"]
        results.append(("8. Human Presence Model", "PASS"))
    except Exception as e:
        results.append(("8. Human Presence Model", f"FAIL: {e}"))

    # Test 9: Movement Classifier
    try:
        movement_model = CSIMovementClassifier()
        m_res = movement_model.classify_movement(features)
        assert m_res["movement_state"] in ["STATIC", "WALKING", "MOVING", "UNKNOWN"]
        results.append(("9. Movement Classifier", "PASS"))
    except Exception as e:
        results.append(("9. Movement Classifier", f"FAIL: {e}"))

    # Test 10: Extended FeatureVectorEngine
    try:
        raw_telemetry = {
            "wifi_rssi_norm": 0.8,
            "ble_rssi_norm": 0.7,
            "audio_db_norm": 0.5,
            "imu_vibration_norm": 0.2,
            "csi_presence_norm": 0.85,
            "distance_est_norm": 0.4
        }
        vec = FeatureVectorEngine.extract(raw_telemetry)
        assert len(vec) == 6
        assert vec[4] == 0.85
        results.append(("10. Extended Feature Vector", "PASS"))
    except Exception as e:
        results.append(("10. Extended Feature Vector", f"FAIL: {e}"))

    # Test 11: Extended SensorFusionEngine (5-modality & 4-modality Fallback)
    try:
        fusion_engine = SensorFusionEngine()
        # 5-modality
        f_res = fusion_engine.fuse_telemetry(norm_dict)
        assert "human_presence_probability" in f_res
        assert f_res["active_mode"] == "RSSI + CSI + BLE + Audio + IMU"

        # 4-modality fallback (CSI missing)
        f_fallback = fusion_engine.fuse_telemetry({"wifi_rssi_norm": 0.8, "ble_rssi_norm": 0.7})
        assert f_fallback["active_mode"] == "RSSI + BLE + Audio + IMU"
        results.append(("11. Dynamic Sensor Fusion", "PASS"))
    except Exception as e:
        results.append(("11. Dynamic Sensor Fusion", f"FAIL: {e}"))

    # Test 12: Data Lake Verification
    try:
        raw_csi = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/raw_data/csi"))
        assert os.path.exists(raw_csi)
        results.append(("12. Data Lake CSI Structure", "PASS"))
    except Exception as e:
        results.append(("12. Data Lake CSI Structure", f"FAIL: {e}"))

    # Summary Output
    print("\nVERIFICATION RESULTS SUMMARY:")
    all_passed = True
    for test_name, status in results:
        color = "\033[92m" if "PASS" in status else "\033[91m"
        print(f"  {test_name:<35} : {color}{status}\033[0m")
        if "FAIL" in status:
            all_passed = False

    print("\n==========================================================")
    if all_passed:
        print("RESULT: ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY!")
    else:
        print("RESULT: SOME VERIFICATION TESTS FAILED.")
    print("==========================================================")


if __name__ == "__main__":
    run_csi_verification_suite()
