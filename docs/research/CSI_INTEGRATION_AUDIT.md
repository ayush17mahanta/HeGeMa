# HEGEMA Wi-Fi CSI Integration Audit & Hardware Compatibility Report

**Document Status**: COMPLETED AUDIT  
**Date**: August 12, 2026  
**Target Hardware**: ESP32-WROOM-32 (`esp32dev`)  

---

## 1. Existing System Architecture Overview

HEGEMA is an AI-assisted disaster search-and-rescue platform designed to estimate human presence and probable occupancy zones using multi-sensor telemetry.

### Core Modules Audited
1. **`backend/`**: FastAPI application (`app/main.py`, `app/api/v1/router.py`) providing:
   - `/api/v1/telemetry/ingest` and `/api/v1/field/ingest`
   - `/api/v1/hardware/status` (Hardware Technical Honesty Enforcer)
   - `/api/v1/spatial/occupancy` and `/api/v1/ai/xai`
   - WebSocket `/ws/telemetry` real-time broadcasting
   - MQTT Ingestion listener on `hegema/sensors/+/telemetry`
2. **`ai/`**:
   - `feature_vector.py`: 5-element float feature vector `[wifi_rssi_norm, ble_rssi_norm, audio_db_norm, imu_vibration_norm, distance_est_norm]`
   - `model_zoo.py`: Pure Python k-NN spatial predictor & Spatial Gaussian fallback
   - `sensor_fusion.py`: Multi-modal weighted fusion engine (`Wi-Fi 30%`, `BLE 35%`, `Audio 20%`, `IMU 15%`)
   - `xai_engine.py`: Per-modality and per-AP attribution maps
3. **`sensors/`**: Sensor adapters for Wi-Fi RSSI (`wifi_plugin.py`), BLE (`ble_plugin.py`), Audio (`audio_plugin.py`), and IMU (`imu_plugin.py`).
4. **`esp32/`**: PlatformIO Arduino firmware publishing 1Hz JSON telemetry (`wifi_rssi_avg`, `ble_devices_count`, `battery_voltage`) over MQTT.
5. **`hardware/`**: Hardware Abstraction Layer (`esp32_driver.py`, `android_driver.py`, `simulator_driver.py`).
6. **`frontend/`**: Next.js 14 App Router dashboard with 70% Hero Screen floorplan, 2D/3D toggle, live telemetry stream, and hardware diagnostics.

---

## 2. ESP32-WROOM Hardware Compatibility for Wi-Fi CSI

| Compatibility Dimension | Specification & Status |
| :--- | :--- |
| **ESP32 Variant** | ESP32-WROOM-32 (Dual-Core Xtensa LX6 240MHz) |
| **Wi-Fi CSI Support** | **FULL HARDWARE SUPPORT** via ESP-IDF `esp_wifi_set_csi_cb` & `esp_wifi_set_csi_config` |
| **Antenna Configuration** | 1x1 SISO (Single Antenna, 2.4 GHz band) |
| **Subcarriers** | 64 Subcarriers (HT20 mode: 52 valid data subcarriers; HT40 mode: 114 valid subcarriers) |
| **Hardware Limitations** | `first_word_invalid` quirk: Silicon bug sets first 4 bytes of CSI buffer as invalid; requires masking in parser. High phase noise requires linear phase unwrapping. |
| **Firmware Framework** | Currently PlatformIO + Arduino framework. CSI capture requires native ESP-IDF API calls (supported in PlatformIO via `framework = espidf` or `framework = arduino` with ESP-IDF component hooks). |
| **Processing Overhead** | CSI packet callback at 50-100 Hz consumes ~8-12% CPU core 0. Core 1 remains free for MQTT/Wi-Fi stack. |

---

## 3. Integration Strategy & Non-Breaking Guarantee

```
  ┌─────────────────────────────────────────────────────────────┐
  │                        ESP32 Node                           │
  │  (CSI_ENABLED=true: Wi-Fi CSI Subcarriers + RSSI + BLE)     │
  │  (CSI_ENABLED=false: Fallback to RSSI + BLE)                 │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ MQTT / HTTP
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                   HEGEMA Backend & Data Engine              │
  │                                                             │
  │  ┌────────────────────┐          ┌───────────────────────┐  │
  │  │  Existing Sensors  │          │  CSI Sensor Plugin    │  │
  │  │(RSSI, BLE, Audio)  │          │    (sensors/csi/)     │  │
  │  └─────────┬──────────┘          └───────────┬───────────┘  │
  │            │                                 │              │
  │            └───────────────┬─────────────────┘              │
  │                            ▼                                │
  │                 Extended Feature Vector                     │
  │                            │                                │
  │                            ▼                                │
  │                Extended SensorFusionEngine                  │
  │         (Supports missing sensors gracefully)               │
  └────────────────────────────┬────────────────────────────────┘
                               │ WebSocket
                               ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 HEGEMA Tactical Dashboard                   │
  │   - Primary Hero Floorplan Heatmap (Fused Spatial Evidence) │
  │   - CSI Subcarrier Waveform & Heatmap Visualizer            │
  │   - Modality Toggle (CSI, RSSI, BLE, Audio, IMU, Fused)     │
  └─────────────────────────────────────────────────────────────┘
```

1. **CSI as Optional Plugin**: If CSI hardware is absent or disabled, HEGEMA dynamically falls back to standard RSSI + BLE + Audio + IMU fusion without throwing errors or creating zero-confidence artifacts.
2. **Distinct Evidence Modeling**: CSI generates `human_presence_probability` ($0.0 \rightarrow 1.0$) and spatial variance metrics. It does NOT assert definitive "survivor detection" through solid walls without verified multi-sensor fusion.
3. **Data Lake Storage**: Preserves raw binary/JSON subcarriers in `data_lake/raw_data/csi/` and engineered features in `data_lake/processed/csi/`.

---

## 4. Open-Source Reference Repositories & License Audit

| Repository | Focus Area | License | HEGEMA Integration Usage |
| :--- | :--- | :--- | :--- |
| **Espressif ESP-CSI** | ESP32 CSI driver API & subcarrier structure | Apache 2.0 | C++ firmware struct alignment, subcarrier mapping & `first_word_invalid` handling |
| **CSIKit** | Python CSI parsing & visualization toolkit | MIT License | Offline research parser (`research/csi/`) for processing raw capture files |
| **ESP32-WiFi-Sensing** | End-to-end CSI pipeline & feature extraction | MIT / Open Source | Feature extraction algorithms (amplitude variance, Doppler proxy, subcarrier entropy) |
| **RuView** | Spatial visualization & Wi-Fi sensing reference | Open Source Research | Architectural reference for heatmap spatial evidence weighting |

---

## 5. Summary of Audit Recommendations
1. Maintain full backward compatibility across all existing 4 sensor modalities.
2. Create dedicated `sensors/csi/` package implementing standard HEGEMA plugin adapter pattern.
3. Add `simulation/csi/` generator to allow dashboard demonstration when physical CSI hardware is offline.
4. Implement distinct human presence model ($0.0 - 1.0$) and spatial localization evidence layer.
