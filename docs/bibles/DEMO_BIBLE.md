# Demo Bible — HEGEMA
**Hackathon Presentation Runbook & Earthquake Scenario Demonstration**

---

## 1. Hackathon Elevator Pitch & Framing
> *"When disaster strikes, indoor GPS fails and optical cameras are blinded by smoke and rubble. HEGEMA establishes an AI-powered wireless heatmap grid using accessible ESP32 nodes and field smartphones to estimate survivor locations, giving emergency responders instant visual guidance."*

## 2. 3-Minute Live Presentation Script

| Time | Action | Visual Screen |
| :--- | :--- | :--- |
| **0:00 - 0:45** | Introduce disaster problem statement & non-surveillance ethical framing | Base floor plan view |
| **0:45 - 1:30** | Click **"Trigger Earthquake Disaster Scenario"** | Simulated survivors spawn & move on canvas |
| **1:30 - 2:15** | Open **Explainable AI (XAI) Drawer** to show multi-sensor attribution (BLE, RSSI, Audio) | Real-time SHAP feature breakdown bar chart |
| **2:15 - 3:00** | Scrub **Timeline Player** (10:00 -> 10:05 -> 10:10) showing room-to-room survivor movement | Heatmap updates dynamically across time steps |

## 3. Simulator Presets
- **Preset 1**: Single stationary survivor tapping for help (High Audio + IMU attribution).
- **Preset 2**: Two moving occupants evacuating through Corridor B (High BLE + Wi-Fi RSSI attribution).
- **Preset 3**: Complex Multi-zone Earthquake Scenario with 4 simulated survivors and RF noise.
