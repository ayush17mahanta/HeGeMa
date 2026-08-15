#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "csi_capture.h"

#define CSI_ENABLED true

const char* ssid = "HEGEMA_TACTICAL_WIFI";
const char* password = "search_and_rescue";
const char* mqtt_server = "192.168.1.100"; // Laptop Edge Broker IP

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("[HEGEMA] Initializing ESP32 Node Firmware...");
  setup_wifi();
  client.setServer(mqtt_server, 1883);

  #if CSI_ENABLED
  if (!hegema_csi_init()) {
    Serial.println("[HEGEMA WARNING] CSI unavailable — continuing with RSSI/BLE mode.");
  }
  #endif
}

void publish_telemetry() {
  StaticJsonDocument<512> doc;
  doc["node_id"] = "esp32_wroom_01";
  doc["wifi_rssi_avg"] = WiFi.RSSI();
  doc["ble_devices_count"] = 2;
  doc["battery_voltage"] = 4.15;
  doc["csi_active"] = hegema_csi_is_active();

  char buffer[512];
  serializeJson(doc, buffer);
  client.publish("hegema/sensors/esp32_01/telemetry", buffer);
}

void loop() {
  if (!client.connected()) {
    client.connect("ESP32_HEGEMA_Node");
  }
  client.loop();
  publish_telemetry();
  delay(1000); // 1 Hz telemetry tick
}
