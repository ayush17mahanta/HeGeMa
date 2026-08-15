# RuView Research Analysis & Spatial Heatmap Concepts

---

## Technical Analysis

1. **Spatial Evidence Layers**: RuView demonstrates spatial probability layering across indoor grids. In HEGEMA, this is integrated as a toggleable heatmap evidence layer (`CSI Layer`, `RSSI Layer`, `BLE Layer`, `Audio Layer`, `IMU Layer`, `Fused Layer`).
2. **Confidence Weighting**: Raw CSI disturbance cannot independently claim "survivor detection". HEGEMA fuses CSI human presence evidence with acoustic taps, BLE beacon signals, and Wi-Fi RSSI to derive a fused spatial probability map.
