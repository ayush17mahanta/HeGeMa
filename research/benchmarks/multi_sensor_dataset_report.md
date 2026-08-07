# HEGEMA — Multi-Sensor Dataset & Modular AI Pipeline Report

## 1. Datasets Ingested

| Modality | Storage Path | Rows | Primary Features | Target Label |
| :--- | :--- | :---: | :--- | :--- |
| **Wi-Fi RSSI** | `data_lake/processed/wifi.csv` | 119,968 | Normalized Signal dBm | Spatial Coordinate ($z$) |
| **BLE RSSI** | `data_lake/processed/ble.csv` | 5,000 | BLE RSSI, Estimated Distance | Zone ID |
| **IMU Motion** | `data_lake/processed/imu.csv` | 5,000 | Accel X/Y/Z, Gyro Magnitude | Activity State |
| **Audio Acoustic** | `data_lake/processed/audio.csv` | 5,000 | RMS Energy, ZCR, MFCC, Spectral Centroid | Acoustic Event |

## 2. Modular AI ModelZoo Performance

| Modality | Algorithm | Samples | Accuracy | Inference Latency | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Wi-Fi Model** | Modular Random Forest | 119,968 | 93.78% | 0.0688 ms | ✅ OPERATIONAL |
| **BLE Model** | Modular Random Forest | 5,000 | 96.44% | 0.085 ms | ✅ OPERATIONAL |
| **IMU Model** | Modular Random Forest | 5,000 | 96.05% | 0.0412 ms | ✅ OPERATIONAL |
| **Audio Model** | Modular Random Forest | 5,000 | 93.09% | 0.0846 ms | ✅ OPERATIONAL |

> [!NOTE]
> **Datasets Disclaimer**: Public datasets (Indoor Wi-Fi, Indoor BLE, HAR IMU, AudioSet metadata) are utilized to validate the modular Sensor Fusion AI pipeline for the hackathon MVP. They do **not** represent real-world earthquake or disaster survivor data.
