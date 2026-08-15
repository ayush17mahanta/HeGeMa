# ESP32-WROOM Hardware Compatibility Analysis for Wi-Fi CSI

---

## 1. Hardware Specifications

- **Module**: ESP32-WROOM-32 (`esp32dev`)
- **SoC**: Espressif ESP32-D0WDQ6 (Dual-Core Xtensa LX6 @ 240MHz)
- **Wi-Fi Transceiver**: 802.11 b/g/n (2.4 GHz)
- **Antenna Architecture**: 1x1 SISO (Single Input Single Output, PCB Trace Antenna)
- **CSI Subcarriers**: 64 subcarriers (HT20) / 128 subcarriers (HT40)

---

## 2. Firmware API Integration

Requires ESP-IDF Wi-Fi promiscuous mode CSI callback:

```cpp
#include "esp_wifi.h"

wifi_csi_config_t csi_config = {
    .lltf_en           = true,
    .htltf_en          = true,
    .stbc_htltf2_en    = true,
    .ltf_merge_en      = true,
    .channel_filter_en = true,
    .manu_scale        = false,
    .shift             = false,
};

esp_wifi_set_csi_config(&csi_config);
esp_wifi_set_csi_rx_cb(hegema_csi_rx_callback, NULL);
esp_wifi_set_csi(true);
```

---

## 3. Hardware Quirks & Mitigation

1. **`first_word_invalid` Silicon Bug**:
   - ESP32 hardware sets the first word (4 bytes) of the CSI data array to 0 or invalid values.
   - **Mitigation**: `CSIPreprocessor` inspects `obs.first_word_invalid` and replaces index `0..3` with median subcarrier value.
2. **Phase Noise**:
   - High carrier frequency offset (CFO) and sampling phase offset (SPO).
   - **Mitigation**: Linear phase sanitization unwraps angles and subtracts linear regression slope.
