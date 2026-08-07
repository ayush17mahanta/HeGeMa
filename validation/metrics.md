# HEGEMA — Experimental Validation Log & Metrics

This directory contains empirical validation logs, room test datasets, and experimental metrics collected during physical hardware deployments and simulation validation runs.

---

## Evaluation Benchmark Disclaimer
> [!NOTE]
> Initial benchmark metrics (e.g., 0.516 ms inference latency, 89%–96% accuracy range) reflect baseline performance on the **Simulation Environment Dataset**. Real-world field accuracy metrics will be continuously appended below as physical room testing progresses.

---

## Room Test Matrix

| Environment | Test Setup | Sensor Nodes | Primary Features | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Room 101** | Line-of-sight RF | 1 ESP32, 1 Android | Wi-Fi RSSI, BLE | Pending Field Test |
| **Room 102** | Obstacle / Attenuation | 1 ESP32, 1 Android | RSSI + Audio Tap | Pending Field Test |
| **Room 105** | Multi-room Zone | 2 ESP32, 2 Android | RSSI + BLE + IMU | Pending Field Test |
| **Earthquake Demo** | Synthetic Disaster Simulation | 3 Simulated Nodes | Full Sensor Matrix | ✅ Verified (Sim) |

---

## Ethical & Scientific Framing Statement
HEGEMA **estimates probable survivor occupied zones** using authorized sensor data and AI feature fusion to help rescue teams prioritize search efforts. It does not claim 100% survivor certainty.
