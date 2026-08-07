# API Bible — HEGEMA
**REST Endpoints, WebSocket Protocol & MQTT Topic Specifications**

---

## 1. REST Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/missions/start` | Initialize active search-and-rescue mission session |
| `GET` | `/api/v1/missions/active` | Get active mission metadata |
| `GET` | `/api/v1/floors/{floor_id}/heatmap` | Fetch snapshot grid matrix of occupancy probabilities |
| `GET` | `/api/v1/ai/xai/{zone_id}` | Fetch Explainable AI feature attributions for room zone |
| `GET` | `/api/v1/models/compare` | Retrieve performance comparison matrix across Model Zoo |
| `POST` | `/api/v1/simulation/trigger` | Trigger earthquake or survivor movement scenario |

## 2. WebSocket Protocol Schema
Endpoint: `ws://localhost:8000/ws/v1/missions/{mission_id}/live`

Sample Payload (`HEATMAP_GRID_UPDATE`):
```json
{
  "type": "HEATMAP_GRID_UPDATE",
  "timestamp": 1723026000,
  "floor_id": "floor_101",
  "grid_width": 20,
  "grid_height": 15,
  "probabilities": [
    [0.01, 0.02, 0.05, 0.12],
    [0.04, 0.88, 0.92, 0.45],
    [0.02, 0.15, 0.30, 0.08]
  ],
  "confidence_score": 0.89
}
```

## 3. MQTT Topic Hierarchy
- `hegema/sensors/{node_id}/telemetry`
- `hegema/sensors/{node_id}/status`
- `hegema/control/scenario`
