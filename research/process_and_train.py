import csv
import os
import sys
import time
import math
import json
from collections import defaultdict

def process_and_train():
    dataset_path = r"C:\Users\Hunardeep Kaur\Downloads\archive (1)\rssi.csv"
    if not os.path.exists(dataset_path):
        archive_dir = r"C:\Users\Hunardeep Kaur\Downloads\archive (1)"
        if os.path.exists(archive_dir):
            csvs = [f for f in os.listdir(archive_dir) if f.endswith('.csv')]
            if csvs:
                dataset_path = os.path.join(archive_dir, csvs[0])

    print("==========================================================")
    print("HEGEMA HEURISTIC & ML RSSI PIPELINE")
    print(f"Loading raw dataset: {dataset_path}")
    print("==========================================================")

    if not os.path.exists(dataset_path):
        print(f"Error: {dataset_path} not found.")
        return

    # 1. Read & Inspect CSV
    raw_rows = []
    aps_set = set()
    invalid_rows = 0

    with open(dataset_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            try:
                ap = r["ap"].strip()
                sig = float(r["signal"]) if r["signal"].strip() != "" else -100.0
                seq = float(r["sequence"]) if r["sequence"].strip() != "" else 0.0
                x = float(r["x"]) if r["x"].strip() != "" else None
                y = float(r["y"]) if r["y"].strip() != "" else None
                z = float(r["z"]) if r["z"].strip() != "" else None

                if x is None or y is None:
                    invalid_rows += 1
                    continue

                aps_set.add(ap)
                raw_rows.append({
                    "ap": ap,
                    "signal": sig,
                    "sequence": seq,
                    "x": int(x),
                    "y": int(y),
                    "z": int(z) if z is not None else 0
                })
            except Exception:
                invalid_rows += 1

    sorted_aps = sorted(list(aps_set))
    print(f"Raw rows parsed: {len(raw_rows)} (Skipped invalid: {invalid_rows})")
    print(f"Access Points ({len(sorted_aps)}): {sorted_aps}")

    # 2. Group into snapshot feature vectors per (x, y, sequence)
    snapshots = defaultdict(dict)
    for row in raw_rows:
        key = (row["x"], row["y"], row["sequence"])
        snapshots[key][row["ap"]] = row["signal"]

    print(f"Grouped into {len(snapshots)} unique feature vector snapshots.")

    # 3. Build Feature Matrix X and Target Labels y
    feature_names = [f"rssi_ap_{ap}" for ap in sorted_aps]
    X_samples = []
    y_labels = []
    zone_names = set()

    for (x, y, seq), ap_signals in snapshots.items():
        # Create normalized feature vector
        vec = []
        for ap in sorted_aps:
            val = ap_signals.get(ap, -100.0) # -100 dBm if missing
            # Bounded RSSI normalization [-100 dBm, -30 dBm] -> [0.0, 1.0]
            norm_val = round(max(0.0, min(1.0, (val + 100.0) / 70.0)), 4)
            vec.append(norm_val)
        
        zone_id = f"Zone_X{x}_Y{y}"
        X_samples.append(vec)
        y_labels.append(zone_id)
        zone_names.add(zone_id)

    sorted_zones = sorted(list(zone_names))
    print(f"Total processed samples: {len(X_samples)}")
    print(f"Total spatial zones/rooms: {len(sorted_zones)}")

    # 4. Save cleaned feature dataset to data_lake/processed/
    processed_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/processed"))
    os.makedirs(processed_dir, exist_ok=True)
    cleaned_csv = os.path.join(processed_dir, "cleaned_rssi_features.csv")

    with open(cleaned_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(feature_names + ["predicted_zone"])
        for vec, label in zip(X_samples, y_labels):
            writer.writerow(vec + [label])

    print(f"Saved cleaned feature matrix to: {cleaned_csv}")

    # 5. Try ML training with scikit-learn / joblib
    try:
        import numpy as np
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import LabelEncoder
        from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
        from sklearn.metrics import accuracy_score, precision_recall_fscore_support
        import joblib

        print("\n--- Training ML Model Zoo ---")
        X = np.array(X_samples)
        encoder = LabelEncoder()
        y = encoder.fit_transform(y_labels)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.30, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
        )

        models = {
            "RandomForestClassifier": RandomForestClassifier(n_estimators=100, random_state=42),
            "ExtraTreesClassifier": ExtraTreesClassifier(n_estimators=100, random_state=42)
        }

        best_acc = -1.0
        best_name = None
        best_model = None

        for name, m in models.items():
            t0 = time.perf_counter()
            m.fit(X_train, y_train)
            t_train = (time.perf_counter() - t0) * 1000.0

            t0_inf = time.perf_counter()
            y_pred = m.predict(X_test)
            t_inf = ((time.perf_counter() - t0_inf) * 1000.0) / len(X_test)

            acc = accuracy_score(y_test, y_pred)
            prec, rec, f1, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

            print(f"Model: {name:25s} | Acc: {acc*100:.2f}% | F1: {f1:.4f} | Train: {t_train:.1f}ms | Latency: {t_inf:.4f}ms/sample")

            if acc > best_acc:
                best_acc = acc
                best_name = name
                best_model = m

        models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/models"))
        os.makedirs(models_dir, exist_ok=True)
        joblib.dump(best_model, os.path.join(models_dir, "hegema_model.pkl"))
        joblib.dump(encoder, os.path.join(models_dir, "label_encoder.pkl"))

        metadata = {
            "best_model_name": best_name,
            "best_accuracy": round(best_acc, 4),
            "feature_columns": feature_names,
            "class_names": [str(c) for c in encoder.classes_],
            "num_features": len(feature_names),
            "total_samples": len(X_samples),
            "num_zones": len(sorted_zones),
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        with open(os.path.join(models_dir, "model_metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        print(f"\n[OK] Exported Best Model ({best_name}) to data_lake/models/hegema_model.pkl")

    except ImportError:
        print("\nNote: scikit-learn not available yet; data lake feature extraction completed successfully.")

if __name__ == "__main__":
    process_and_train()
