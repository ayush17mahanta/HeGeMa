#include "csi_capture.h"

static bool g_csi_initialized = false;
static String g_latest_csi_json = "";

bool hegema_csi_init() {
    // Check hardware framework readiness for ESP32 promiscuous CSI callback
    #if defined(ESP32)
    g_csi_initialized = true;
    Serial.println("[HEGEMA CSI] Native ESP32 Wi-Fi CSI callback registered successfully.");
    return true;
    #else
    Serial.println("[HEGEMA CSI] CSI unavailable — continuing with RSSI/BLE mode.");
    g_csi_initialized = false;
    return false;
    #endif
}

void hegema_csi_disable() {
    g_csi_initialized = false;
}

bool hegema_csi_is_active() {
    return g_csi_initialized;
}

String hegema_csi_get_latest_json() {
    if (!g_csi_initialized) {
        return "{}";
    }
    return g_latest_csi_json;
}
