# ESP32-WiFi-Sensing Repository Architectural Analysis

---

## Key Lessons Learned & Extracted Concepts

1. **Subcarrier Processing**: High-frequency subcarrier amplitude variance is a reliable proxy for motion disturbances in static indoor environments.
2. **Feature Extraction**: Combined temporal variance, spectral entropy, and frame-to-frame Doppler proxies provide explainable indicators without requiring high-latency neural networks.
3. **Decoupled Architecture**: Telemetry transport (MQTT) should be strictly separated from signal processing pipelines to ensure low latency and zero UI blocking.
