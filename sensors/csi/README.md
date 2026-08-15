# HEGEMA Wi-Fi CSI Sensor Plugin

Modular sensor plugin for processing Wi-Fi Channel State Information (CSI) subcarriers collected by ESP32 nodes.

## Package Architecture

```
sensors/csi/
├── csi_types.py          # Data models (CSIObservation, CSIFeatureVector)
├── csi_preprocessor.py   # Hardware byte masking, Hampel filter, phase sanitization
├── csi_features.py       # 11 explainable feature extractors
├── csi_adapter.py        # Standard HEGEMA plugin adapter
├── csi_buffer.py         # Circular ring buffer for sliding temporal windows
├── csi_transport.py      # MQTT / HTTP JSON transport parser
└── __init__.py           # Package exports
```

## Features Extracted
1. `amplitude_mean`: Mean subcarrier amplitude.
2. `amplitude_std`: Standard deviation across temporal window.
3. `amplitude_variance`: Variance across temporal window.
4. `amplitude_range`: Max - Min subcarrier amplitude spread.
5. `temporal_variance`: Variance of frame mean amplitudes over window.
6. `temporal_energy`: Energy metric over sliding window.
7. `packet_rate`: Packets per second throughput.
8. `amplitude_entropy`: Shannon entropy of subcarrier histogram distribution.
9. `subcarrier_std_mean`: Mean subcarrier standard deviation.
10. `phase_sanitized_std`: Standard deviation of sanitized phase.
11. `doppler_proxy`: Temporal frame-to-frame fluctuation proxy.
