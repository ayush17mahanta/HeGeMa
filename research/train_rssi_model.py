import os
import sys
import time
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import joblib

def main():
    dataset_path = r"C:\Users\Hunardeep Kaur\Downloads\archive (1)\rssi.csv"
    if not os.path.exists(dataset_path):
        # Fallback check for any csv inside the archive folder
        archive_dir = r"C:\Users\Hunardeep Kaur\Downloads\archive (1)"
        if os.path.exists(archive_dir):
            csvs = [f for f in os.listdir(archive_dir) if f.endswith('.csv')]
            if csvs:
                dataset_path = os.path.join(archive_dir, csvs[0])
    
    print(f"=== HEGEMA RSSI DATASET INTEGRATION & TRAINING PIPELINE ===")
    print(f"Target Dataset Path: {dataset_path}")

    if not os.path.exists(dataset_path):
        print(f"ERROR: Dataset file not found at {dataset_path}")
        sys.exit(1)

    # 1. Inspection
    df_raw = pd.read_csv(dataset_path)
    total_samples_raw, total_cols_raw = df_raw.shape
    print(f"Raw Dataset Shape: {total_samples_raw} rows x {total_cols_raw} columns")

    # 2. Cleaning & Preprocessing
    initial_duplicates = df_raw.duplicated().sum()
    df_clean = df_raw.drop_duplicates().copy()

    # Detect RSSI columns vs Target Label columns
    col_names = df_clean.columns.tolist()
    
    # Identify target column: room, location, label, zone, or last column
    target_col = None
    possible_targets = ['room', 'location', 'zone', 'label', 'target', 'Room', 'Location', 'Zone', 'Label']
    for candidate in possible_targets:
        if candidate in col_names:
            target_col = candidate
            break
    
    if target_col is None:
        target_col = col_names[-1] # Default to last column if no explicit match

    print(f"Detected Target Column: '{target_col}'")

    # Identify feature columns (RSSI signals or numeric feature columns excluding target)
    feature_cols = [c for c in col_names if c != target_col]
    
    # Handle missing values: fill with -100 dBm for RSSI
    df_clean[feature_cols] = df_clean[feature_cols].fillna(-100.0)

    # Save cleaned dataset to data_lake/processed/
    processed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/processed"))
    os.makedirs(processed_dir, exist_ok=True)
    cleaned_file_path = os.path.join(processed_dir, "cleaned_rssi.csv")
    df_clean.to_csv(cleaned_file_path, index=False)
    print(f"Cleaned dataset saved to: {cleaned_file_path}")

    # 3. Label Encoding & Feature Vector Prep
    X = df_clean[feature_cols].values
    y_raw = df_clean[target_col].values

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(y_raw)
    class_names = [str(cls) for cls in label_encoder.classes_]

    # Normalize/Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 4. Dataset Split: 70% Train, 15% Val, 15% Test
    X_train, X_temp, y_train, y_temp = train_test_split(
        X_scaled, y, test_size=0.30, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
    )
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp if len(np.unique(y_temp)) > 1 else None
    )

    print(f"Dataset Split -> Train: {X_train.shape[0]} | Val: {X_val.shape[0]} | Test: {X_test.shape[0]}")

    # 5. Model Zoo Training & Comparison
    models = {
        "RandomForestClassifier": RandomForestClassifier(n_estimators=100, random_state=42),
        "ExtraTreesClassifier": ExtraTreesClassifier(n_estimators=100, random_state=42)
    }

    # Optional XGBoost / LightGBM import
    try:
        from xgboost import XGBClassifier
        models["XGBoostClassifier"] = XGBClassifier(n_estimators=100, random_state=42, eval_metric="mlogloss")
    except ImportError:
        print("XGBoost not installed; skipping gracefully.")

    results = {}
    best_model_name = None
    best_accuracy = -1.0
    best_model_obj = None

    for name, model in models.items():
        print(f"\n--- Training {name} ---")
        t_start = time.perf_counter()
        model.fit(X_train, y_train)
        t_train_ms = (time.perf_counter() - t_start) * 1000.0

        t_infer_start = time.perf_counter()
        y_pred = model.predict(X_test)
        t_infer_ms = ((time.perf_counter() - t_infer_start) * 1000.0) / len(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "training_time_ms": round(t_train_ms, 2),
            "inference_time_ms_per_sample": round(t_infer_ms, 4),
            "confusion_matrix": cm
        }

        print(f"{name} -> Accuracy: {acc*100:.2f}% | F1: {f1:.4f} | Inference Latency: {t_infer_ms:.4f} ms/sample")

        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_obj = model

    # 6. Best Model Export
    models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/models"))
    os.makedirs(models_dir, exist_ok=True)
    model_export_path = os.path.join(models_dir, "hegema_model.pkl")
    scaler_export_path = os.path.join(models_dir, "scaler.pkl")
    encoder_export_path = os.path.join(models_dir, "label_encoder.pkl")

    joblib.dump(best_model_obj, model_export_path)
    joblib.dump(scaler, scaler_export_path)
    joblib.dump(label_encoder, encoder_export_path)

    metadata = {
        "best_model_name": best_model_name,
        "best_accuracy": round(best_accuracy, 4),
        "target_column": target_col,
        "feature_columns": feature_cols,
        "class_names": class_names,
        "num_features": len(feature_cols),
        "dataset_samples": total_samples_raw,
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    
    metadata_path = os.path.join(models_dir, "model_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n✅ Selected Best Model: {best_model_name} (Accuracy: {best_accuracy*100:.2f}%)")
    print(f"Exported Model Artifact to: {model_export_path}")

    # 7. Generate Evaluation & Benchmark Markdown Report
    benchmarks_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../research/benchmarks"))
    os.makedirs(benchmarks_dir, exist_ok=True)
    report_path = os.path.join(benchmarks_dir, "dataset_training_report.md")

    report_md = f"""# HEGEMA — RSSI Dataset Training & Evaluation Report

## 1. Dataset Overview
- **Dataset File**: `{dataset_path}`
- **Raw Samples**: {total_samples_raw} rows
- **Cleaned Samples**: {df_clean.shape[0]} rows (Removed {initial_duplicates} duplicates)
- **Feature Count**: {len(feature_cols)} RSSI sensor signals
- **Target Classes**: {len(class_names)} zones ({', '.join(class_names[:5])}{'...' if len(class_names) > 5 else ''})

## 2. Model Zoo Benchmark Matrix

| Model Algorithm | Accuracy | Precision | Recall | F1-Score | Train Time (ms) | Inference Latency (ms/sample) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
"""
    for name, r in results.items():
        report_md += f"| **{name}** | {r['accuracy']*100:.2f}% | {r['precision']:.4f} | {r['recall']:.4f} | {r['f1_score']:.4f} | {r['training_time_ms']} ms | {r['inference_time_ms_per_sample']} ms |\n"

    report_md += f"""
## 3. Best Model Selected
- **Model**: `{best_model_name}`
- **Accuracy**: `{best_accuracy*100:.2f}%`
- **Saved Model Location**: `data_lake/models/hegema_model.pkl`

> [!NOTE]
> This training run utilizes the public Indoor Wi-Fi RSSI dataset for hackathon baseline validation. When physical ESP32 and Android hardware telemetry streams online, the model can be retrained seamlessly using `python research/train_rssi_model.py`.
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_md)

    print(f"Saved benchmark report to: {report_path}")

if __name__ == "__main__":
    main()
