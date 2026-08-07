import sys
import os
import time

# Add root directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from ai.model_zoo import ModelZoo
from ai.feature_vector import FeatureVectorEngine

def run_model_benchmarks():
    """Runs latency & performance benchmarks across Model Zoo algorithms."""
    print("=" * 60)
    print("HEGEMA AI MODEL ZOO BENCHMARK SUITE")
    print("=" * 60)

    zoo = ModelZoo()
    sample_raw = {
        "wifi_rssi_norm": 0.82,
        "ble_rssi_norm": 0.91,
        "audio_db_norm": 0.45,
        "imu_vibration_norm": 0.15,
        "distance_est_norm": 0.35
    }
    vector = FeatureVectorEngine.extract(sample_raw)

    t0 = time.perf_counter()
    grid = zoo.predict_spatial_occupancy(vector)
    t1 = time.perf_counter()

    latency_ms = (t1 - t0) * 1000.0

    print(f"Sample Grid Output Dimensions: {len(grid)} x {len(grid[0])}")
    print(f"Inference Latency: {latency_ms:.3f} ms")
    print("Model Comparison Performance Matrix:")
    for model_name, metrics in zoo.get_model_benchmarks().items():
        print(f" - {model_name:15s} | Acc: {metrics['accuracy']*100:.1f}% | F1: {metrics['f1_score']:.2f} | Latency: {metrics['latency_ms']} ms")
    print("=" * 60)

if __name__ == "__main__":
    run_model_benchmarks()
