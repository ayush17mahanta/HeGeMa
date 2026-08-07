# Android Bible — HEGEMA
**Kotlin Jetpack Compose Field Scanner Architecture**

---

## 1. Subsystem Architecture
The Android Field Scanner (`android/`) runs on survivor or rescue team mobile devices to gather acoustic tap sound levels, IMU motion vectors, and broadcast rescue beacons.

## 2. Component Layout
```text
android/app/src/main/java/com/hegema/rescue/
├── data/
│   ├── AudioCollector.kt     # AudioRecord Sound Pressure Level (dB)
│   ├── MotionCollector.kt    # Accelerometer / Gyroscope SensorEventListener
│   └── BleBeaconService.kt   # BLE Advertiser & Scanner Service
├── ui/
│   ├── MainActivity.kt
│   ├── FieldDashboardScreen.kt
│   └── RescueBeaconScreen.kt
└── service/
    └── SensorForegroundService.kt
```

## 3. Sensor Data Processing
- **Audio Tap Counter**: Measures sound pressure spikes above dynamic ambient background thresholds:
  $$P_{\text{dB}} = 20 \cdot \log_{10}\left(\frac{A_{\text{sample}}}{A_{\text{ref}}}\right)$$
- **IMU Micro-Vibration**: Calculates vector magnitude of linear acceleration:
  $$a_{\text{mag}} = \sqrt{a_x^2 + a_y^2 + a_z^2} - g$$
