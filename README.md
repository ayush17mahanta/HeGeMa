# HEGEMA — AI-Powered Heatmap Geo Mapping for Disaster Search & Rescue

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Multi-Sensor Pipeline Operational](https://img.shields.io/badge/Status-Multi--Sensor%20AI%20Operational-brightgreen.svg)](docs/MASTER_ARCHITECTURE.md)

**HEGEMA** (Heatmap Geo Mapping AI) is an AI-assisted disaster response platform that estimates survivor occupied zones using a **Hardware Abstraction Layer (HAL)** and **Sensor-Agnostic Feature Vector Pipeline** (Wi-Fi RSSI, BLE, Smartphone Mic, IMU Accelerometer/Gyroscope, and optional CSI plugins).

---

## 📊 Modular Multi-Sensor Datasets & Pipelines

HEGEMA organizes independent multi-sensor datasets in `data_lake/datasets/` and processed matrices in `data_lake/processed/`:

| Modality | Raw Dataset Folder | Processed Data Matrix | Feature Adapter | Modular AI Model |
| :--- | :--- | :--- | :--- | :--- |
| **Wi-Fi RSSI** | `data_lake/datasets/wifi/` | `data_lake/processed/wifi.csv` | `sensors/wifi_plugin.py` (`RSSIAdapter`) | `data_lake/models/wifi_model.json` |
| **BLE RSSI** | `data_lake/datasets/ble/` | `data_lake/processed/ble.csv` | `sensors/ble_plugin.py` (`BLEAdapter`) | `data_lake/models/ble_model.json` |
| **IMU Motion** | `data_lake/datasets/imu/` | `data_lake/processed/imu.csv` | `sensors/imu_plugin.py` (`IMUAdapter`) | `data_lake/models/imu_model.json` |
| **Audio Acoustic** | `data_lake/datasets/audio/` | `data_lake/processed/audio.csv` | `sensors/audio_plugin.py` (`AudioAdapter`) | `data_lake/models/audio_model.json` |

---

## 🔄 Retraining & Sensor Fusion Engine

### 1. Ingest Datasets & Retrain Modular Models
To process raw multi-sensor datasets and train modular AI models:
```bash
python research/download_and_ingest_multisensor.py
```
- **Evaluation Report**: `research/benchmarks/multi_sensor_dataset_report.md`

### 2. Verify Multi-Sensor Fusion Pipeline
```bash
python research/verify_multisensor_pipeline.py
```

### 3. Future Real-World Hardware Swap
When physical ESP32 nodes and Android field smartphones stream live telemetry:
1. Incoming telemetry passes through `HALBaseDriver` adapters in `sensors/`.
2. Hardware signals populate the normalized `FeatureVector` (`wifi_rssi_norm`, `ble_rssi_norm`, `rms_energy_norm`, `accel_mag_norm`).
3. `SensorFusionEngine` in `ai/sensor_fusion.py` combines active sensor predictions dynamically without changing FastAPI routes or Next.js UI components.

---

## 🛠️ Monorepo Quickstart

### 1. Launch Backend API Server
```bash
cd backend
pip install -r requirements.txt
python main.py
```
Backend running at `http://localhost:8000` (OpenAPI: `http://localhost:8000/docs`).

### 2. Launch Next.js Tactical Dashboard
```bash
cd frontend
npm install
npm run dev
```
Dashboard running at `http://localhost:3000`.

---

## Technical Documentation Suite

- **[Master System Architecture](docs/MASTER_ARCHITECTURE.md)** (All 27 Domain Sections)
- **14 Specialized Technical Bibles** in [`docs/bibles/`](docs/bibles/):
  - [Architecture Bible](docs/bibles/ARCHITECTURE_BIBLE.md) | [Backend Bible](docs/bibles/BACKEND_BIBLE.md) | [Frontend Bible](docs/bibles/FRONTEND_BIBLE.md) | [AI Bible](docs/bibles/AI_BIBLE.md)
  - [ESP32 Bible](docs/bibles/ESP32_BIBLE.md) | [Android Bible](docs/bibles/ANDROID_BIBLE.md) | [DevOps Bible](docs/bibles/DEVOPS_BIBLE.md) | [UI Bible](docs/bibles/UI_BIBLE.md)
  - [API Bible](docs/bibles/API_BIBLE.md) | [Security Bible](docs/bibles/SECURITY_BIBLE.md) | [Database Bible](docs/bibles/DATABASE_BIBLE.md) | [Testing Bible](docs/bibles/TESTING_BIBLE.md)
  - [Deployment Bible](docs/bibles/DEPLOYMENT_BIBLE.md) | [Demo Bible](docs/bibles/DEMO_BIBLE.md) | [Pitch & Defense Bible](docs/bibles/PITCH_BIBLE.md)
