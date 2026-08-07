# Security Bible — HEGEMA
**Zero-Trust Security, Authorization Model & Data Privacy Guidelines**

---

## 1. Security Architecture
HEGEMA operates under a **Zero-Trust Local Boundary** model designed for authorized emergency response teams:
- **Local Isolation**: Telemetry and occupancy grid data remain inside the tactical edge network.
- **Node Authentication**: Physical ESP32 and Android field nodes authenticate via pre-shared API keys (`X-Node-API-Key`).
- **User Authentication**: REST and WebSocket connections require signed OAuth2 JWT bearer tokens.

## 2. Role-Based Access Control (RBAC) Matrix

| Action | Incident Commander | Field Rescue Tech | System Admin |
| :--- | :---: | :---: | :---: |
| View Heatmap & XAI | Yes | Yes | Yes |
| Start/End Mission | Yes | No | Yes |
| Trigger Simulation Scenario | Yes | No | Yes |
| Modify Model Zoo Config | No | No | Yes |

## 3. Privacy & Non-Surveillance Guarantees
- No audio raw recording stored; microphone metrics processed into scalar dB levels on device.
- MAC address randomization handled gracefully by feature vector aggregation.
