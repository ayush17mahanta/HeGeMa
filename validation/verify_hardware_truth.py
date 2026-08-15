"""
HEGEMA Automated 10-Scenario Hardware Truth & Zero Fabrication Verification Suite
Tests authoritative SystemRuntimeState engine, LangGraph orchestrator, heartbeat timeouts,
simulation isolation, and zero-fabrication rules across all 3 system modes (OFFLINE, REAL, SIMULATION).
"""

import sys
import os
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.runtime_state import SystemRuntimeState
from ai.orchestration import HEGEMALangGraphOrchestrator


def run_hardware_truth_verification():
    print("==========================================================")
    print("HEGEMA ZERO-FABRICATION HARDWARE TRUTH VERIFICATION")
    print("==========================================================")

    results = []

    # Test 1: Startup Default Mode is OFFLINE
    try:
        engine = SystemRuntimeState(telemetry_timeout_sec=2.0)
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "OFFLINE"
        assert snap["hardware_summary"]["esp32_count"] == 0
        assert snap["telemetry_metrics"]["total_real_packets"] == 0
        results.append(("1. Default Startup Mode (OFFLINE)", "PASS"))
    except Exception as e:
        results.append(("1. Default Startup Mode (OFFLINE)", f"FAIL: {e}"))

    # Test 2: MQTT Online with ESP32 Disconnected
    try:
        engine.update_mqtt_status(connected=True)
        snap = engine.get_state_snapshot()
        assert snap["hardware_summary"]["mqtt_connected"] is True
        assert snap["hardware_summary"]["esp32_count"] == 0
        assert snap["system_mode"] == "OFFLINE"
        results.append(("2. MQTT Connected / Hardware OFFLINE", "PASS"))
    except Exception as e:
        results.append(("2. MQTT Connected / Hardware OFFLINE", f"FAIL: {e}"))

    # Test 3: ESP32 Heartbeat Registration (Transitions to REAL)
    try:
        engine.register_heartbeat(
            device_id="esp32-01",
            device_type="ESP32",
            capabilities=["wifi_rssi", "csi"],
            ip="192.168.1.105"
        )
        snap = engine.get_state_snapshot()
        assert snap["hardware_summary"]["esp32_count"] == 1
        assert snap["system_mode"] == "REAL"
        results.append(("3. ESP32 Heartbeat (REAL Mode Active)", "PASS"))
    except Exception as e:
        results.append(("3. ESP32 Heartbeat (REAL Mode Active)", f"FAIL: {e}"))

    # Test 4: Real Packet Registration
    try:
        engine.record_real_packet(device_id="esp32-01")
        engine.record_real_inference()
        snap = engine.get_state_snapshot()
        assert snap["telemetry_metrics"]["total_real_packets"] == 1
        assert snap["telemetry_metrics"]["total_real_inferences"] == 1
        results.append(("4. Real Packet & Inference Counters", "PASS"))
    except Exception as e:
        results.append(("4. Real Packet & Inference Counters", f"FAIL: {e}"))

    # Test 5: Hardware Timeout (Transitions back to OFFLINE)
    try:
        time.sleep(2.5)  # Exceed 2.0s timeout
        snap = engine.get_state_snapshot()
        assert snap["hardware_summary"]["esp32_count"] == 0
        assert snap["system_mode"] == "OFFLINE"
        results.append(("5. Heartbeat Timeout (Revert to OFFLINE)", "PASS"))
    except Exception as e:
        results.append(("5. Heartbeat Timeout (Revert to OFFLINE)", f"FAIL: {e}"))

    # Test 6: Explicit Simulation Mode Activation
    try:
        session_id = engine.start_simulation(scenario="moving_survivors")
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "SIMULATION"
        assert snap["simulation_enabled"] is True
        assert session_id.startswith("SIM_")
        results.append(("6. Manual Simulation Start", "PASS"))
    except Exception as e:
        results.append(("6. Manual Simulation Start", f"FAIL: {e}"))

    # Test 7: Explicit Simulation Stop
    try:
        engine.stop_simulation()
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "OFFLINE"
        assert snap["simulation_enabled"] is False
        results.append(("7. Manual Simulation Stop", "PASS"))
    except Exception as e:
        results.append(("7. Manual Simulation Stop", f"FAIL: {e}"))

    # Test 8: LangGraph Pipeline OFFLINE Halting
    try:
        orchestrator = HEGEMALangGraphOrchestrator()
        pipeline_state = orchestrator.run_pipeline(
            input_telemetry={},
            system_mode="OFFLINE"
        )
        assert pipeline_state.hardware_status == "OFFLINE"
        assert pipeline_state.feature_vector is None
        assert any("Pipeline halted: Hardware OFFLINE." in evt for evt in pipeline_state.audit_events)
        results.append(("8. LangGraph OFFLINE Halting", "PASS"))
    except Exception as e:
        results.append(("8. LangGraph OFFLINE Halting", f"FAIL: {e}"))

    # Test 9: LangGraph Provenance Tracking
    try:
        pipeline_state_sim = orchestrator.run_pipeline(
            input_telemetry={"wifi_rssi_norm": 0.8, "data_source": "SIMULATION"},
            system_mode="SIMULATION"
        )
        assert pipeline_state_sim.provenance["mode"] == "SIMULATION"
        assert pipeline_state_sim.ai_prediction is not None
        results.append(("9. LangGraph Provenance Tracking", "PASS"))
    except Exception as e:
        results.append(("9. LangGraph Provenance Tracking", f"FAIL: {e}"))

    # Test 10: Zero Fabrication Integrity Check
    try:
        fresh_engine = SystemRuntimeState()
        snap_fresh = fresh_engine.get_state_snapshot()
        assert snap_fresh["system_mode"] == "OFFLINE"
        assert snap_fresh["telemetry_metrics"]["total_real_packets"] == 0
        assert snap_fresh["telemetry_metrics"]["packets_per_minute"] == 0.0
        results.append(("10. Zero Fabrication Integrity", "PASS"))
    except Exception as e:
        results.append(("10. Zero Fabrication Integrity", f"FAIL: {e}"))

    # Print Summary
    print("\nVERIFICATION RESULTS SUMMARY:")
    all_passed = True
    for test_name, status in results:
        color = "\033[92m" if "PASS" in status else "\033[91m"
        print(f"  {test_name:<42} : {color}{status}\033[0m")
        if "FAIL" in status:
            all_passed = False

    print("\n==========================================================")
    if all_passed:
        print("RESULT: ALL 10 HARDWARE TRUTH VERIFICATION TESTS PASSED!")
    else:
        print("RESULT: SOME HARDWARE TRUTH VERIFICATION TESTS FAILED.")
    print("==========================================================")


if __name__ == "__main__":
    run_hardware_truth_verification()
