# AI Bible — HEGEMA
**Sensor-Agnostic Feature Vector, Model Zoo, XAI & AI Pipelines**

---

## 1. Feature Engineering & Vector Schema
Input features are normalized into a fixed $N$-dimensional vector:
```json
{
  "wifi_rssi_mean": -65.4,
  "wifi_rssi_std": 3.2,
  "ble_beacon_max": -72.0,
  "audio_db_level": 48.5,
  "imu_vibration_mag": 0.12,
  "node_distance_est": 4.5
}
```

## 2. Model Zoo Architecture
1. **Random Forest Classifier**: Baseline model (`sklearn.ensemble.RandomForestClassifier`).
2. **XGBoost Regressor**: Gradient boosting model (`xgboost.XGBRegressor`).
3. **LightGBM**: Edge-optimized model (`lightgbm.LGBMRegressor`).
4. **PyTorch 2D CNN**: Spatial grid occupancy estimator (`torch.nn.Module`).

## 3. Explainable AI (XAI) Attribution Engine
Attributions are calculated using SHAP (SHapley Additive exPlanations) or Tree SHAP for fast feature contribution breakdown:
$$\text{Output Score} = \text{Base Value} + \sum_{k=1}^M \phi_k$$

## 4. Production vs. Demo vs. Simulation AI Pipelines
- **`ai/demo/`**: Pre-baked model weights loaded instantly for hackathon presentation mode.
- **`ai/production/`**: Re-training script consuming real-world logged dataset matrices from `data_lake/processed/`.
- **`ai/simulation/`**: Synthetic data generator injecting multi-path fading and acoustic attenuation noise.
