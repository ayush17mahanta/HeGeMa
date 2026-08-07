# ESP32 Bible — HEGEMA
**ESP32 Firmware Architecture, Promiscuous Sniffing & MQTT Telemetry**

---

## 1. Hardware Requirements
- **Microcontroller**: ESP32-WROOM-32 / ESP32-S3.
- **Peripherals**: Onboard Wi-Fi (802.11 b/g/n) & Bluetooth Low Energy (BLE 4.2 / 5.0).
- **Power**: 5V USB / LiPo Battery pack for field deployment.

## 2. Firmware Architecture (PlatformIO)
```text
esp32/
├── src/
│   ├── main.cpp              # Task Setup & Main Loop
│   ├── wifi_sniffer.cpp      # Promiscuous Wi-Fi RSSI Packet Filter
│   ├── ble_scanner.cpp       # BLE Beacon Scanner Task
│   ├── mqtt_client.cpp       # Asynchronous MQTT Publisher
│   └── config.h              # Node ID, WiFi SSIDs, Broker Address
└── platformio.ini
```

## 3. Wi-Fi Promiscuous Sniffing Implementation
The firmware sets the Wi-Fi interface into promiscuous mode to capture raw management frames (probe requests):
```cpp
void wifi_promiscuous_cb(void* buf, wifi_promiscuous_pkt_type_t type) {
    wifi_promiscuous_pkt_t *pkt = (wifi_promiscuous_pkt_t*)buf;
    int rssi = pkt->rx_ctrl.rssi;
    // Pack RSSI and source MAC into telemetry payload buffer
}
```

## 4. Telemetry MQTT JSON Schema
```json
{
  "node_id": "esp32_node_01",
  "timestamp": 1723026000,
  "wifi_rssi_avg": -68,
  "ble_devices_count": 3,
  "battery_voltage": 4.15
}
```
