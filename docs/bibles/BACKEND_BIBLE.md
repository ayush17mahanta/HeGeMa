# Backend Bible — HEGEMA
**FastAPI Service Architecture, WebSocket Streaming & MQTT Integration**

---

## 1. Subsystem Overview
The backend service (`backend/`) is built on **FastAPI** using asynchronous Python (`asyncio`, `asyncpg`, `pydantic v2`). It acts as the core telemetry ingest engine, database API, WebSocket broadcaster, and AI model inference controller.

## 2. Directory Structure
```text
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── missions.py
│   │   │   │   ├── sensors.py
│   │   │   │   ├── heatmap.py
│   │   │   │   └── xai.py
│   │   │   └── router.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── telemetry_bridge.py
│   │   ├── heatmap_service.py
│   │   └── simulation_service.py
│   └── websockets/
│       └── manager.py
├── main.py
└── pyproject.toml
```

## 3. Dependency Injection & Service Layer
FastAPI dependencies are used for database sessions (`get_db_session`), security authentication (`get_current_user`), and singleton manager injection (`get_ws_manager`).

## 4. Real-time Telemetry Bridge
The background telemetry subscriber reads MQTT messages from Mosquitto and forwards feature vectors to the AI inference engine:
```python
async def handle_mqtt_telemetry(client, topic, payload):
    driver = HALRegistry.get_driver_for_topic(topic)
    vector = driver.normalize_feature_vector(json.loads(payload))
    heatmap_matrix, xai_scores = await ai_engine.predict_occupancy(vector)
    await ws_manager.broadcast_heatmap(heatmap_matrix)
```
