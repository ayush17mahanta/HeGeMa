# HEGEMA CSI BIBLE: Wi-Fi Channel State Information Reference Manual

**Authoritative Technical Documentation for CSI Sensing in HEGEMA**

---

## 1. Executive Summary

Wi-Fi Channel State Information (CSI) measures the fine-grained physical layer (PHY) amplitude and phase response across subcarrier frequencies ($20/40$ MHz bandwidth). In HEGEMA, CSI operates as an optional 5th sensor modality alongside Wi-Fi RSSI, BLE, Audio, and IMU.

---

## 2. Signal Model & ESP32 Subcarrier Structure

The Channel Frequency Response (CFR) at subcarrier $k$ is represented as:

$$H(k) = |H(k)| e^{j \angle H(k)}$$

- **Subcarriers**: 64 subcarriers in 20MHz HT20 mode (52 valid data subcarriers, 4 pilots, 8 guard/nulls).
- **ESP32 Silicon Quirk**: The first 4 bytes of CSI buffer are invalid due to an ESP32 hardware register bug (`first_word_invalid`). HEGEMA masks these first 4 bytes in `CSIPreprocessor`.

---

## 3. Feature Extraction Pipeline

`CSIFeatureExtractor` derives 11 features from temporal sliding windows ($W = 20..50$ frames):
1. `amplitude_mean`: Average subcarrier amplitude.
2. `amplitude_std`: Standard deviation across window.
3. `amplitude_variance`: Temporal variance across window.
4. `amplitude_range`: Peak-to-peak subcarrier amplitude spread.
5. `temporal_variance`: Variance of frame mean amplitudes over window.
6. `temporal_energy`: Signal energy over window.
7. `packet_rate`: Packets per second throughput.
8. `amplitude_entropy`: Shannon entropy of subcarrier amplitude histogram.
9. `subcarrier_std_mean`: Average per-subcarrier standard deviation.
10. `phase_sanitized_std`: Standard deviation of unwrapped, linear-sanitized phase.
11. `doppler_proxy`: Frame-to-frame high-frequency fluctuation index.

---

## 4. Multi-Modal Fusion Integration

CSI feeds into `SensorFusionEngine`. If CSI is absent or offline, weights re-scale dynamically:

| Modality State | Wi-Fi RSSI | Wi-Fi CSI | BLE | Audio | IMU |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **All Modalities Active** | 25% | 25% | 25% | 15% | 10% |
| **CSI Offline (Fallback)** | 30% | — | 35% | 20% | 15% |

---

## 5. API & MQTT Endpoints

- MQTT Topic: `hegema/sensors/csi/{node_id}/telemetry`
- REST Endpoint: `POST /api/v1/csi/ingest`
- REST Endpoint: `GET /api/v1/csi/status`
- WebSocket Event: `CSI_UPDATE`
