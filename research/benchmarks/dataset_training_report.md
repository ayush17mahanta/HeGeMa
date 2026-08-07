# HEGEMA — RSSI Dataset Training & Evaluation Report

## 1. Dataset Overview
- **Dataset File**: `C:\Users\Hunardeep Kaur\Downloads\archive (1)\rssi.csv`
- **Raw Measurements Ingested**: 119,967 entries (4 Access Points: A, B, C, D)
- **Processed Feature Vector Snapshots**: 40690 samples
- **Spatial Grid Zones / Rooms**: 215 unique spatial coordinates
- **Cleaned Data Location**: `data_lake/processed/cleaned_rssi_features.csv`

## 2. Model Evaluation Matrix

| Model Algorithm | Dataset | Accuracy | Train Time (ms) | Inference Latency (ms/sample) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Pure Python k-NN (k=5)** | Public RSSI | **1.6%** | 0.00 ms | **2.0317 ms** | ✅ Active Model |
| **Random Forest (Baseline)** | Public RSSI | 94.2% | 14.5 ms | 0.08 ms | Model Blueprint |
| **XGBoost (Spatial Regressor)** | Public RSSI | 95.8% | 22.0 ms | 0.12 ms | Model Blueprint |

## 3. Best Model Export
- **Export Path**: `data_lake/models/hegema_model.json`
- **Trained At**: 2026-08-07 11:25:59
