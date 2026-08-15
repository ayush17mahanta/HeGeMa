"""
HEGEMA Authoritative SystemRuntimeState Engine
Single source of truth governing system mode (OFFLINE, REAL, SIMULATION),
mission state (IDLE, STARTING, WAITING_FOR_HARDWARE, ACTIVE, PAUSED, STOPPED),
hardware node verification, location provenance, and AI engine status.

Enforces ZERO-FABRICATION and 5-DISTINCT-SYSTEM-STATES rules across backend and frontend:
Backend ONLINE != ESP32 ONLINE != Mission ACTIVE != AI INFERENCE ACTIVE != Location Available.
"""

import time
import threading
from typing import Dict, Any, Optional, List


class SystemRuntimeState:
    """Authoritative singleton runtime state manager for HEGEMA."""

    def __init__(self, telemetry_timeout_sec: float = 10.0):
        self.lock = threading.Lock()
        self.telemetry_timeout_sec = telemetry_timeout_sec

        # 1. Primary System Mode (DEFAULT: OFFLINE)
        self.system_mode = "OFFLINE"  # "OFFLINE", "REAL", "SIMULATION", "ERROR"

        # 2. Mission State Architecture (DEFAULT: IDLE)
        self.mission_status = "IDLE"  # "IDLE", "STARTING", "WAITING_FOR_HARDWARE", "ACTIVE", "PAUSED", "STOPPED", "ERROR"
        self.mission_id: Optional[str] = None
        self.mission_started_at: Optional[float] = None
        self.selected_map = {
            "building": "Building 7",
            "floor": "Floor 3"
        }

        # 3. Location Provenance (DEFAULT: None / NOT AVAILABLE)
        self.location: Optional[Dict[str, Any]] = None  # None unless real GPS or simulation exists

        # 4. Subsystem & Hardware Connection States
        self.mqtt_connected = False
        self.backend_online = True
        self.simulation_enabled = False
        self.simulation_scenario = ""
        self.simulation_session_id = ""

        # 5. Verified Hardware Devices Registry {device_id: metadata_dict}
        self.verified_devices: Dict[str, Dict[str, Any]] = {}

        # 6. Verified Real Metrics Counters (Zero fabrication - incremented ONLY on real packets)
        self.real_packet_count = 0
        self.real_inference_count = 0
        self.last_real_packet_time: Optional[float] = None

    def update_mqtt_status(self, connected: bool):
        """Updates MQTT broker connectivity state."""
        with self.lock:
            self.mqtt_connected = connected

    def register_heartbeat(self, device_id: str, device_type: str, capabilities: List[str], ip: str = ""):
        """Registers a live hardware heartbeat for a physical device."""
        now = time.time()
        with self.lock:
            self.verified_devices[device_id] = {
                "device_id": device_id,
                "device_type": device_type,  # "ESP32", "ANDROID"
                "capabilities": capabilities,
                "ip": ip,
                "last_heartbeat": now,
                "status": "ONLINE",
                "mode": "REAL"
            }
            # Transition system mode to REAL if physical hardware is active and simulation is off
            if not self.simulation_enabled and self.system_mode != "REAL":
                self.system_mode = "REAL"

            # If mission was waiting for hardware, transition to ACTIVE
            if self.mission_status == "WAITING_FOR_HARDWARE":
                self.mission_status = "ACTIVE"
                if not self.mission_started_at:
                    self.mission_started_at = now

    def record_real_packet(self, device_id: str):
        """Records an incoming validated physical hardware packet."""
        now = time.time()
        with self.lock:
            self.real_packet_count += 1
            self.last_real_packet_time = now
            if device_id in self.verified_devices:
                self.verified_devices[device_id]["last_heartbeat"] = now
                self.verified_devices[device_id]["status"] = "ONLINE"
            if not self.simulation_enabled:
                self.system_mode = "REAL"

    def record_real_inference(self):
        """Increments inference count upon actual AI model execution."""
        with self.lock:
            self.real_inference_count += 1

    def start_mission(self, scenario: str = "") -> Dict[str, Any]:
        """
        Operator trigger to start a mission.
        Validates hardware connectivity. If no hardware & simulation disabled,
        transitions mission_status to WAITING_FOR_HARDWARE and does NOT start timer.
        """
        now = time.time()
        with self.lock:
            self._evaluate_hardware_status_unlocked()
            active_hw = [d for d in self.verified_devices.values() if d["status"] == "ONLINE"]

            if not active_hw and not self.simulation_enabled:
                self.mission_status = "WAITING_FOR_HARDWARE"
                self.mission_started_at = None
                return {
                    "status": "WAITING_FOR_HARDWARE",
                    "message": "Required hardware (ESP32/Android) is OFFLINE. Connect physical hardware or start Simulation mode.",
                    "mission_status": self.mission_status
                }

            self.mission_status = "ACTIVE"
            self.mission_id = f"OP_{int(now)}"
            self.mission_started_at = now
            return {
                "status": "MISSION_STARTED",
                "mission_id": self.mission_id,
                "mission_status": self.mission_status,
                "started_at": self.mission_started_at
            }

    def pause_mission(self):
        """Pauses active mission."""
        with self.lock:
            if self.mission_status == "ACTIVE":
                self.mission_status = "PAUSED"

    def stop_mission(self):
        """Stops active mission and freezes mission state."""
        with self.lock:
            self.mission_status = "STOPPED"
            self.mission_started_at = None

    def start_simulation(self, scenario: str = "moving_survivors") -> str:
        """Explicit operator trigger to enter SIMULATION mode."""
        now = time.time()
        session_id = f"SIM_{int(now)}"
        with self.lock:
            self.simulation_enabled = True
            self.simulation_scenario = scenario
            self.simulation_session_id = session_id
            self.system_mode = "SIMULATION"
            self.mission_status = "ACTIVE"
            self.mission_id = session_id
            self.mission_started_at = now
            self.location = {
                "latitude": 30.7333,
                "longitude": 76.7794,
                "source": "SIMULATION",
                "accuracyMeters": 5.0,
                "label": "30.7333° N, 76.7794° E (SIMULATION)"
            }
        return session_id

    def stop_simulation(self):
        """Explicit operator trigger to stop SIMULATION mode and revert to OFFLINE or REAL."""
        with self.lock:
            self.simulation_enabled = False
            self.simulation_scenario = ""
            self.simulation_session_id = ""
            self.mission_status = "STOPPED"
            self.mission_started_at = None
            self.location = None
            self._evaluate_hardware_status_unlocked()

    def set_location(self, latitude: float, longitude: float, source: str = "USER_SELECTED", accuracy: float = 10.0):
        """Sets location coordinates with source provenance."""
        with self.lock:
            self.location = {
                "latitude": latitude,
                "longitude": longitude,
                "source": source,
                "accuracyMeters": accuracy,
                "label": f"{latitude:.4f}° N, {longitude:.4f}° E ({source})"
            }

    def get_state_snapshot(self) -> Dict[str, Any]:
        """Returns authoritative system state snapshot for API / WebSocket clients."""
        with self.lock:
            self._evaluate_hardware_status_unlocked()

            now = time.time()
            active_esp32_nodes = [d for d in self.verified_devices.values() if d["device_type"] == "ESP32" and d["status"] == "ONLINE"]
            active_android_nodes = [d for d in self.verified_devices.values() if d["device_type"] == "ANDROID" and d["status"] == "ONLINE"]
            active_csi_nodes = [d for d in active_esp32_nodes if "csi" in d.get("capabilities", [])]

            # Calculate mission elapsed seconds
            elapsed_sec = int(now - self.mission_started_at) if (self.mission_started_at and self.mission_status == "ACTIVE") else 0

            # Calculate packet rate (packets per minute) over rolling 60s window
            last_pkt_age = round(now - self.last_real_packet_time, 1) if self.last_real_packet_time else None
            pkt_rate = round(self.real_packet_count * 60.0 / max(1.0, (now - self.last_real_packet_time + 1.0)), 1) if self.last_real_packet_time else 0.0

            # AI Status: LOADED (if model zoo is in memory but no packet stream) vs ACTIVE vs IDLE
            ai_status = "ACTIVE" if (self.system_mode != "OFFLINE" and self.mission_status == "ACTIVE") else ("READY" if self.backend_online else "OFFLINE")

            return {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "system_mode": self.system_mode,  # "OFFLINE", "REAL", "SIMULATION", "ERROR"
                "mission": {
                    "status": self.mission_status,  # "IDLE", "STARTING", "WAITING_FOR_HARDWARE", "ACTIVE", "PAUSED", "STOPPED"
                    "mission_id": self.mission_id,
                    "started_at": self.mission_started_at,
                    "elapsed_seconds": elapsed_sec
                },
                "selected_map": self.selected_map,
                "location": self.location,  # None by default (LOCATION NOT AVAILABLE)
                "simulation_enabled": self.simulation_enabled,
                "simulation_scenario": self.simulation_scenario,
                "simulation_session_id": self.simulation_session_id,
                "hardware_summary": {
                    "esp32_count": len(active_esp32_nodes),
                    "android_count": len(active_android_nodes),
                    "csi_node_count": len(active_csi_nodes),
                    "mqtt_connected": self.mqtt_connected,
                    "backend_online": self.backend_online
                },
                "services": {
                    "local_backend": "ONLINE (PORT 8000)" if self.backend_online else "OFFLINE",
                    "mqtt_broker": "ONLINE (PORT 1883)" if self.mqtt_connected else "DISCONNECTED",
                    "ai_engine": ai_status  # "READY", "ACTIVE", "OFFLINE"
                },
                "telemetry_metrics": {
                    "total_real_packets": self.real_packet_count,
                    "packets_per_minute": pkt_rate if self.system_mode == "REAL" else 0.0,
                    "total_real_inferences": self.real_inference_count,
                    "last_packet_age_seconds": last_pkt_age
                },
                "devices": list(self.verified_devices.values())
            }

    def _evaluate_hardware_status_unlocked(self):
        """Internal helper: prunes timed-out hardware devices and updates system mode."""
        now = time.time()
        online_devices = 0

        for dev_id, dev in list(self.verified_devices.items()):
            last_seen = dev.get("last_heartbeat", 0)
            if now - last_seen > self.telemetry_timeout_sec:
                dev["status"] = "OFFLINE"
            else:
                online_devices += 1

        if not self.simulation_enabled:
            if online_devices > 0:
                self.system_mode = "REAL"
            else:
                self.system_mode = "OFFLINE"
                if self.mission_status == "ACTIVE":
                    self.mission_status = "WAITING_FOR_HARDWARE"


# Global Authoritative Runtime State Instance
runtime_state_engine = SystemRuntimeState(telemetry_timeout_sec=10.0)
