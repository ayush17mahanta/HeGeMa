"""
HEGEMA Automated 10-Scenario State Consistency & 5-System-States Verification Suite
Tests complete alignment across Navbar, Sidebar, Mission Timer, GPS Location,
and Hardware views under SystemRuntimeState engine.
"""

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.runtime_state import SystemRuntimeState


def run_state_consistency_verification():
    print("==========================================================")
    print("HEGEMA SECOND-PASS STATE CONSISTENCY VERIFICATION")
    print("==========================================================")

    results = []

    # Scenario 1: Application Startup Default State
    try:
        engine = SystemRuntimeState(telemetry_timeout_sec=2.0)
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "OFFLINE"
        assert snap["mission"]["status"] == "IDLE"
        assert snap["mission"]["elapsed_seconds"] == 0
        assert snap["location"] is None  # LOCATION NOT AVAILABLE
        assert snap["services"]["local_backend"] == "ONLINE (PORT 8000)"
        assert snap["services"]["ai_engine"] == "READY"
        results.append(("1. Startup Default State (IDLE / OFFLINE / 00:00:00)", "PASS"))
    except Exception as e:
        results.append(("1. Startup Default State (IDLE / OFFLINE / 00:00:00)", f"FAIL: {e}"))

    # Scenario 2: Start Mission without Hardware
    try:
        res = engine.start_mission()
        snap = engine.get_state_snapshot()
        assert res["status"] == "WAITING_FOR_HARDWARE"
        assert snap["mission"]["status"] == "WAITING_FOR_HARDWARE"
        assert snap["mission"]["elapsed_seconds"] == 0
        results.append(("2. Start Mission w/ No Hardware (WAITING FOR HARDWARE)", "PASS"))
    except Exception as e:
        results.append(("2. Start Mission w/ No Hardware (WAITING FOR HARDWARE)", f"FAIL: {e}"))

    # Scenario 3: Physical Heartbeat Arrival during Waiting State
    try:
        engine.register_heartbeat(
            device_id="esp32-01",
            device_type="ESP32",
            capabilities=["wifi_rssi", "csi"],
            ip="192.168.1.101"
        )
        snap = engine.get_state_snapshot()
        assert snap["hardware_summary"]["esp32_count"] == 1
        assert snap["mission"]["status"] == "ACTIVE"
        assert snap["system_mode"] == "REAL"
        assert snap["services"]["ai_engine"] == "ACTIVE"
        results.append(("3. Hardware Connection (Transitions to ACTIVE & REAL)", "PASS"))
    except Exception as e:
        results.append(("3. Hardware Connection (Transitions to ACTIVE & REAL)", f"FAIL: {e}"))

    # Scenario 4: Pause Active Mission
    try:
        engine.pause_mission()
        snap = engine.get_state_snapshot()
        assert snap["mission"]["status"] == "PAUSED"
        results.append(("4. Pause Mission State (PAUSED)", "PASS"))
    except Exception as e:
        results.append(("4. Pause Mission State (PAUSED)", f"FAIL: {e}"))

    # Scenario 5: Stop Mission
    try:
        engine.stop_mission()
        snap = engine.get_state_snapshot()
        assert snap["mission"]["status"] == "STOPPED"
        assert snap["mission"]["elapsed_seconds"] == 0
        results.append(("5. Stop Mission State (STOPPED / Timer Reset)", "PASS"))
    except Exception as e:
        results.append(("5. Stop Mission State (STOPPED / Timer Reset)", f"FAIL: {e}"))

    # Scenario 6: Start Simulation Explicitly
    try:
        engine.verified_devices.clear()
        session_id = engine.start_simulation(scenario="moving_survivors")
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "SIMULATION"
        assert snap["mission"]["status"] == "ACTIVE"
        assert snap["location"]["source"] == "SIMULATION"
        assert session_id.startswith("SIM_")
        results.append(("6. Manual Simulation Start (ACTIVE / SIMULATION)", "PASS"))
    except Exception as e:
        results.append(("6. Manual Simulation Start (ACTIVE / SIMULATION)", f"FAIL: {e}"))

    # Scenario 7: Stop Simulation
    try:
        engine.stop_simulation()
        snap = engine.get_state_snapshot()
        assert snap["system_mode"] == "OFFLINE"
        assert snap["mission"]["status"] == "STOPPED"
        assert snap["location"] is None
        results.append(("7. Manual Simulation Stop (OFFLINE / STOPPED)", "PASS"))
    except Exception as e:
        results.append(("7. Manual Simulation Stop (OFFLINE / STOPPED)", f"FAIL: {e}"))

    # Scenario 8: User-Selected GPS Location
    try:
        engine.set_location(latitude=30.7333, longitude=76.7794, source="USER_SELECTED")
        snap = engine.get_state_snapshot()
        assert snap["location"]["source"] == "USER_SELECTED"
        assert "USER_SELECTED" in snap["location"]["label"]
        results.append(("8. Operator Location Provenance", "PASS"))
    except Exception as e:
        results.append(("8. Operator Location Provenance", f"FAIL: {e}"))

    # Scenario 9: Selected Map Decoupled from Mission Status
    try:
        snap = engine.get_state_snapshot()
        assert snap["selected_map"]["building"] == "Building 7"
        assert snap["selected_map"]["floor"] == "Floor 3"
        assert snap["mission"]["status"] in ["IDLE", "STOPPED"]
        results.append(("9. Map Selection Decoupled from Mission State", "PASS"))
    except Exception as e:
        results.append(("9. Map Selection Decoupled from Mission State", f"FAIL: {e}"))

    # Scenario 10: 5-System-States Absolute Independence (Fresh Engine)
    try:
        fresh_engine = SystemRuntimeState(telemetry_timeout_sec=2.0)
        snap = fresh_engine.get_state_snapshot()
        # Backend ONLINE != ESP32 ONLINE != Mission ACTIVE != AI ACTIVE != Location Available
        assert snap["services"]["local_backend"] == "ONLINE (PORT 8000)"
        assert snap["hardware_summary"]["esp32_count"] == 0
        assert snap["mission"]["status"] == "IDLE"
        assert snap["services"]["ai_engine"] == "READY"
        assert snap["location"] is None
        results.append(("10. 5-System-States Absolute Independence", "PASS"))
    except Exception as e:
        results.append(("10. 5-System-States Absolute Independence", f"FAIL: {e}"))

    # Summary
    print("\nVERIFICATION RESULTS SUMMARY:")
    all_passed = True
    for test_name, status in results:
        color = "\033[92m" if "PASS" in status else "\033[91m"
        print(f"  {test_name:<50} : {color}{status}\033[0m")
        if "FAIL" in status:
            all_passed = False

    print("\n==========================================================")
    if all_passed:
        print("RESULT: ALL 10 STATE CONSISTENCY VERIFICATION TESTS PASSED!")
    else:
        print("RESULT: SOME STATE CONSISTENCY VERIFICATION TESTS FAILED.")
    print("==========================================================")


if __name__ == "__main__":
    run_state_consistency_verification()
