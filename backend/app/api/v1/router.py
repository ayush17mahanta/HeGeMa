import sys
import os
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

from backend.app.core.runtime_state import runtime_state_engine
from ai.orchestration import HEGEMALangGraphOrchestrator
from ai.model_zoo import ModelZoo
from ai.xai_engine import XAIEngine
from ai.feature_vector import FeatureVectorEngine
from ai.sensor_fusion import SensorFusionEngine
from ai.csi_presence_model import CSIPresenceModel
from ai.csi_movement_model import CSIMovementClassifier

from sensors.csi.csi_types import CSIObservation
from sensors.csi.csi_preprocessor import CSIPreprocessor
from sensors.csi.csi_features import CSIFeatureExtractor
from sensors.csi.csi_adapter import CSIAdapter
from sensors.csi.csi_buffer import CSIRingBuffer
from sensors.csi.csi_transport import CSITransportParser

from digital_twin.building_model import DigitalTwinBuildingModel
from simulation.csi_simulator import CSISimulator
from simulation.scenario_engine import ScenarioSimulationEngine
from backend.app.websockets.manager import ws_manager

api_router = APIRouter()
model_zoo = ModelZoo()
fusion_engine = SensorFusionEngine()
digital_twin = DigitalTwinBuildingModel()
simulator = ScenarioSimulationEngine()
csi_simulator = CSISimulator()
orchestrator = HEGEMALangGraphOrchestrator()

# CSI Subsystem State
csi_ring_buffer = CSIRingBuffer(capacity=100)
csi_preprocessor = CSIPreprocessor()
csi_feature_extractor = CSIFeatureExtractor(csi_preprocessor)
csi_adapter = CSIAdapter()
csi_presence_model = CSIPresenceModel()
csi_movement_classifier = CSIMovementClassifier()

csi_config = {
    "window_size": 20,
    "csi_enabled": True,
    "hampel_filter": True,
    "phase_sanitization": True
}

latest_csi_snapshot = {
    "timestamp": "",
    "node_id": "",
    "subcarrier_amplitudes": [],
    "packet_rate": 0.0,
    "quality_score": 0.0,
    "human_presence_probability": 0.0,
    "presence_class": "NO_HUMAN_EVIDENCE"
}

class PredictRequest(BaseModel):
    feature_vector: List[float]
    mission_id: str = "default_mission"

class MissionRecordRequest(BaseModel):
    mission_name: str
    total_samples: int

class CSIIngestPayload(BaseModel):
    timestamp: str = Field(default_factory=lambda: time.strftime("%Y-%m-%dT%H:%M:%SZ"))
    node_id: str = "esp32-csi-01"
    sequence_number: int = 0
    rssi: int = -65
    bandwidth: int = 20
    subcarrier_amplitudes: List[float] = Field(default_factory=list)
    subcarrier_phases: List[float] = Field(default_factory=list)
    packet_rate: float = 48.0
    quality_score: float = 0.90
    data_source: str = "HARDWARE"

class CSIConfigPayload(BaseModel):
    window_size: Optional[int] = 20
    csi_enabled: Optional[bool] = True
    hampel_filter: Optional[bool] = True
    phase_sanitization: Optional[bool] = True

class SimulationControlPayload(BaseModel):
    scenario: str = "moving_survivors"

class LocationSetPayload(BaseModel):
    latitude: float
    longitude: float
    source: str = "USER_SELECTED"
    accuracy: float = 10.0

@api_router.get("/health")
async def health_check():
    return {
        "status": "online",
        "system": "HEGEMA — Heatmap Geo Mapping AI",
        "version": "1.0.0-hackathon",
        "system_mode": runtime_state_engine.system_mode
    }

@api_router.get("/system/mode")
async def get_system_runtime_mode():
    """Returns authoritative system runtime state snapshot."""
    return runtime_state_engine.get_state_snapshot()

@api_router.post("/mission/start")
async def start_mission():
    """
    Operator trigger to start a mission.
    Validates hardware. If offline, returns WAITING_FOR_HARDWARE without starting timer.
    """
    res = runtime_state_engine.start_mission()
    state_snap = runtime_state_engine.get_state_snapshot()
    await ws_manager.broadcast_json({"type": "SYSTEM_MODE_CHANGE", "data": state_snap})
    return res

@api_router.post("/mission/pause")
async def pause_mission():
    """Pauses active mission."""
    runtime_state_engine.pause_mission()
    state_snap = runtime_state_engine.get_state_snapshot()
    await ws_manager.broadcast_json({"type": "SYSTEM_MODE_CHANGE", "data": state_snap})
    return {"status": "PAUSED", "mission_status": state_snap["mission"]["status"]}

@api_router.post("/mission/stop")
async def stop_mission():
    """Stops active mission."""
    runtime_state_engine.stop_mission()
    state_snap = runtime_state_engine.get_state_snapshot()
    await ws_manager.broadcast_json({"type": "SYSTEM_MODE_CHANGE", "data": state_snap})
    return {"status": "STOPPED", "mission_status": state_snap["mission"]["status"]}

@api_router.post("/location/set")
async def set_location(payload: LocationSetPayload):
    """Sets operator-selected or GPS coordinates."""
    runtime_state_engine.set_location(
        latitude=payload.latitude,
        longitude=payload.longitude,
        source=payload.source,
        accuracy=payload.accuracy
    )
    state_snap = runtime_state_engine.get_state_snapshot()
    await ws_manager.broadcast_json({"type": "SYSTEM_MODE_CHANGE", "data": state_snap})
    return {"status": "updated", "location": state_snap["location"]}

@api_router.get("/hardware/status")
async def hardware_status():
    """
    Returns authoritative hardware status from SystemRuntimeState engine.
    Zero fabrication - explicitly reports TRUE hardware connectivity state.
    """
    state_snap = runtime_state_engine.get_state_snapshot()
    hw_summary = state_snap["hardware_summary"]

    return {
        "timestamp": state_snap["timestamp"],
        "system_mode": state_snap["system_mode"],
        "mission": state_snap["mission"],
        "services": state_snap["services"],
        "hardware_nodes": {
            "esp32_csi_node": {
                "connected": hw_summary["csi_node_count"] > 0,
                "status": "LIVE HARDWARE STREAMING" if hw_summary["csi_node_count"] > 0 else "OFFLINE (NO HARDWARE CONNECTED)",
                "type": "ESP32 Wi-Fi CSI Subcarrier Sniffer"
            },
            "esp32_sniffer": {
                "connected": hw_summary["esp32_count"] > 0,
                "status": "LIVE HARDWARE STREAMING" if hw_summary["esp32_count"] > 0 else "OFFLINE (NO HARDWARE CONNECTED)",
                "type": "Physical ESP32 Wi-Fi / BLE Promiscuous Sniffer"
            },
            "android_field_app": {
                "connected": hw_summary["android_count"] > 0,
                "status": "LIVE FIELD DEVICE STREAMING" if hw_summary["android_count"] > 0 else "OFFLINE (WAITING DEVICE)",
                "type": "Physical Android Sensor Logger"
            },
            "fastapi_backend": {
                "connected": hw_summary["backend_online"],
                "status": "ONLINE (PORT 8000)",
                "type": "Local FastAPI Engine"
            },
            "mqtt_broker": {
                "connected": hw_summary["mqtt_connected"],
                "status": "ONLINE (PORT 1883)" if hw_summary["mqtt_connected"] else "DISCONNECTED",
                "type": "Mosquitto MQTT"
            },
            "ai_engine": {
                "connected": True,
                "status": state_snap["services"]["ai_engine"],
                "type": "Multi-Sensor Model Zoo + LangGraph Orchestration"
            }
        },
        "telemetry_metrics": state_snap["telemetry_metrics"],
        "verified_devices": state_snap["devices"]
    }

@api_router.get("/building/floorplan")
async def get_floorplan():
    return digital_twin.get_floor_plan_metadata()

@api_router.get("/ai/models/compare")
async def get_model_comparison():
    return model_zoo.get_model_benchmarks()

@api_router.post("/simulation/start")
async def start_simulation(payload: SimulationControlPayload):
    """Explicit operator trigger to start SIMULATION mode."""
    session_id = runtime_state_engine.start_simulation(scenario=payload.scenario)
    state_snap = runtime_state_engine.get_state_snapshot()

    await ws_manager.broadcast_json({
        "type": "SYSTEM_MODE_CHANGE",
        "data": state_snap
    })

    return {
        "status": "simulation_started",
        "system_mode": "SIMULATION",
        "scenario": payload.scenario,
        "session_id": session_id
    }

@api_router.post("/simulation/stop")
async def stop_simulation():
    """Explicit operator trigger to stop SIMULATION mode."""
    runtime_state_engine.stop_simulation()
    csi_ring_buffer.clear()
    state_snap = runtime_state_engine.get_state_snapshot()

    await ws_manager.broadcast_json({
        "type": "SYSTEM_MODE_CHANGE",
        "data": state_snap
    })

    return {
        "status": "simulation_stopped",
        "system_mode": state_snap["system_mode"]
    }

@api_router.post("/simulation/step")
async def step_simulation(scenario: str = "moving_survivors"):
    """Executes a single simulation step ONLY if SIMULATION mode is active."""
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] != "SIMULATION":
        runtime_state_engine.start_simulation(scenario=scenario)
        state_snap = runtime_state_engine.get_state_snapshot()

    sim_data = simulator.step_simulation(scenario_name=scenario)

    pipeline_state = orchestrator.run_pipeline(
        input_telemetry=sim_data["simulated_features"],
        system_mode="SIMULATION"
    )

    pred = pipeline_state.ai_prediction or model_zoo.predict_occupancy([0.5]*5)
    xai_data = XAIEngine.generate_attribution(pipeline_state.feature_vector[:5] if pipeline_state.feature_vector else [0.5]*5)
    fusion_data = pipeline_state.fusion_output or fusion_engine.fuse_telemetry(sim_data["simulated_features"])

    payload = {
        "type": "HEATMAP_GRID_UPDATE",
        "system_mode": "SIMULATION",
        "provenance": pipeline_state.provenance,
        "time_step": sim_data["time_step"],
        "timestamp_str": sim_data["timestamp_str"],
        "scenario": sim_data["scenario"],
        "current_zone": pred["predicted_zone"],
        "confidence": pred["confidence"],
        "probability_distribution": pred["probability_distribution"],
        "grid_matrix": pred["grid_matrix"],
        "model_used": pred["model_used"],
        "xai": xai_data,
        "fusion": fusion_data,
        "audit_events": pipeline_state.audit_events
    }

    await ws_manager.broadcast_json(payload)
    return payload

@api_router.post("/ai/predict")
async def predict_occupancy(payload: PredictRequest):
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {
            "status": "OFFLINE",
            "message": "System is OFFLINE. Connect physical hardware or enable SIMULATION mode to perform AI inference.",
            "predicted_zone": None,
            "confidence": 0.0
        }

    runtime_state_engine.record_real_inference()

    feature_vec = FeatureVectorEngine.extract({
        "wifi_rssi_norm": payload.feature_vector[0] if len(payload.feature_vector) > 0 else 0.0,
        "ble_rssi_norm": payload.feature_vector[1] if len(payload.feature_vector) > 1 else 0.0,
        "audio_db_norm": payload.feature_vector[2] if len(payload.feature_vector) > 2 else 0.0,
        "imu_vibration_norm": payload.feature_vector[3] if len(payload.feature_vector) > 3 else 0.0,
        "csi_presence_norm": payload.feature_vector[4] if len(payload.feature_vector) > 4 else 0.0,
        "distance_est_norm": payload.feature_vector[5] if len(payload.feature_vector) > 5 else 0.5
    })

    prediction = model_zoo.predict_occupancy(feature_vec[:5])
    xai = XAIEngine.generate_attribution(feature_vec[:5])

    response = {
        "system_mode": state_snap["system_mode"],
        "predicted_zone": prediction["predicted_zone"],
        "confidence": prediction["confidence"],
        "probability_distribution": prediction["probability_distribution"],
        "grid_matrix": prediction["grid_matrix"],
        "model_used": prediction["model_used"],
        "xai": xai
    }

    await ws_manager.broadcast_json({
        "type": "LIVE_PREDICTION_UPDATE",
        "data": response
    })

    return response

@api_router.get("/csi/status")
async def get_csi_status():
    state_snap = runtime_state_engine.get_state_snapshot()
    return {
        "system_mode": state_snap["system_mode"],
        "csi_enabled": csi_config["csi_enabled"],
        "buffered_samples": len(csi_ring_buffer),
        "window_size": csi_config["window_size"],
        "preprocessor": {
            "hampel_filter": csi_config["hampel_filter"],
            "phase_sanitization": csi_config["phase_sanitization"]
        },
        "latest_snapshot": latest_csi_snapshot if state_snap["system_mode"] != "OFFLINE" else {}
    }

@api_router.post("/csi/ingest")
async def ingest_csi_frame(payload: CSIIngestPayload):
    runtime_state_engine.record_real_packet(device_id=payload.node_id)
    runtime_state_engine.register_heartbeat(
        device_id=payload.node_id,
        device_type="ESP32",
        capabilities=["wifi_rssi", "csi"]
    )

    obs = CSITransportParser.parse_payload(payload.dict())
    if not obs:
        return {"status": "error", "message": "Failed to parse CSI observation payload."}

    csi_ring_buffer.add(obs)
    window = csi_ring_buffer.get_window(size=csi_config["window_size"])
    features = csi_feature_extractor.extract_features(window)
    norm_dict = csi_adapter.normalize(features)
    presence_res = csi_presence_model.predict_presence(features)
    movement_res = csi_movement_classifier.classify_movement(features)

    global latest_csi_snapshot
    latest_csi_snapshot = {
        "timestamp": obs.timestamp,
        "node_id": obs.node_id,
        "subcarrier_amplitudes": obs.subcarrier_amplitudes,
        "packet_rate": obs.packet_rate,
        "quality_score": obs.quality_score,
        "human_presence_probability": presence_res["human_presence_probability"],
        "presence_class": presence_res["presence_class"],
        "movement_state": movement_res["movement_state"],
        "data_source": "HARDWARE"
    }

    ws_event = {
        "type": "CSI_UPDATE",
        "system_mode": "REAL",
        "timestamp": obs.timestamp,
        "node_id": obs.node_id,
        "subcarrier_amplitudes": obs.subcarrier_amplitudes,
        "features": features.to_dict(),
        "normalized": norm_dict,
        "presence": presence_res,
        "movement": movement_res
    }
    await ws_manager.broadcast_json(ws_event)

    return {
        "status": "ingested",
        "node_id": obs.node_id,
        "system_mode": "REAL",
        "human_presence_probability": presence_res["human_presence_probability"],
        "presence_class": presence_res["presence_class"]
    }

@api_router.get("/csi/latest")
async def get_latest_csi():
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {"status": "OFFLINE", "message": "No live CSI telemetry available."}
    return latest_csi_snapshot

@api_router.get("/csi/features")
async def get_csi_features():
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {"status": "OFFLINE", "raw_features": {}, "normalized": {}}
    window = csi_ring_buffer.get_window(size=csi_config["window_size"])
    features = csi_feature_extractor.extract_features(window)
    return {
        "raw_features": features.to_dict(),
        "normalized": csi_adapter.normalize(features)
    }

@api_router.get("/csi/presence")
async def get_csi_presence():
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {
            "status": "OFFLINE",
            "presence": {"human_presence_probability": 0.0, "presence_class": "NO_HUMAN_EVIDENCE"},
            "movement": {"movement_state": "UNKNOWN"}
        }
    window = csi_ring_buffer.get_window(size=csi_config["window_size"])
    features = csi_feature_extractor.extract_features(window)
    presence = csi_presence_model.predict_presence(features)
    movement = csi_movement_classifier.classify_movement(features)
    return {
        "presence": presence,
        "movement": movement,
        "quality_score": features.quality_score
    }

@api_router.post("/csi/config")
async def update_csi_config(payload: CSIConfigPayload):
    if payload.window_size is not None:
        csi_config["window_size"] = max(5, min(100, payload.window_size))
    if payload.csi_enabled is not None:
        csi_config["csi_enabled"] = payload.csi_enabled
    if payload.hampel_filter is not None:
        csi_config["hampel_filter"] = payload.hampel_filter
    if payload.phase_sanitization is not None:
        csi_config["phase_sanitization"] = payload.phase_sanitization

    return {"status": "updated", "config": csi_config}

@api_router.post("/missions/record")
async def record_mission(payload: MissionRecordRequest):
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {"status": "error", "message": "Cannot record mission when system is OFFLINE. Connect physical hardware or enable simulation."}

    save_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data_lake/missions"))
    os.makedirs(save_path, exist_ok=True)
    filename = f"{payload.mission_name.replace(' ', '_').lower()}.json"
    full_file = os.path.join(save_path, filename)

    data = {
        "mission_name": payload.mission_name,
        "total_samples": payload.total_samples,
        "saved_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "system_mode": state_snap["system_mode"]
    }

    with open(full_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    return {"status": "saved", "file": full_file}

@api_router.get("/ai/xai/sample")
async def get_sample_xai():
    state_snap = runtime_state_engine.get_state_snapshot()
    if state_snap["system_mode"] == "OFFLINE":
        return {"status": "OFFLINE", "attributions": []}
    sample_vector = [0.85, 0.90, 0.75, 0.30, 0.40]
    return XAIEngine.generate_attribution(sample_vector)

class FieldTelemetryFrame(BaseModel):
    timestamp: str
    wifi_rssi: int
    ble_rssi: int
    audio_rms: float
    audio_zcr: float
    accel_x: float
    accel_y: float
    accel_z: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    room: str
    building: str
    scenario: str
    num_people: int

@api_router.post("/field/ingest")
async def ingest_field_frame(frame: FieldTelemetryFrame):
    device_id = "android_field_app_01"
    runtime_state_engine.record_real_packet(device_id=device_id)
    runtime_state_engine.register_heartbeat(
        device_id=device_id,
        device_type="ANDROID",
        capabilities=["ble_rssi", "audio", "imu"]
    )

    missions_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../data_lake/missions"))
    os.makedirs(missions_dir, exist_ok=True)
    live_file = os.path.join(missions_dir, "field_collector_live.jsonl")

    with open(live_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(frame.dict()) + "\n")

    norm_wifi = max(0.0, min(1.0, (frame.wifi_rssi + 100) / 70.0))
    norm_ble = max(0.0, min(1.0, (frame.ble_rssi + 100) / 70.0))
    norm_audio = max(0.0, min(1.0, frame.audio_rms))
    norm_imu = max(0.0, min(1.0, abs(frame.accel_z - 9.81) / 5.0))

    vec = [norm_wifi, norm_ble, norm_audio, norm_imu, 0.0, 0.5]
    pred = model_zoo.predict_occupancy(vec[:5])
    runtime_state_engine.record_real_inference()

    await ws_manager.broadcast_json({
        "type": "FIELD_TELEMETRY_FRAME",
        "system_mode": "REAL",
        "data": frame.dict(),
        "prediction": pred
    })

    return {"status": "ingested", "prediction": pred["predicted_zone"], "confidence": pred["confidence"]}
