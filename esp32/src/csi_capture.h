#ifndef HEGEMA_CSI_CAPTURE_H
#define HEGEMA_CSI_CAPTURE_H

#include <Arduino.h>

#ifdef __cplusplus
extern "C" {
#endif

// ESP32 Native Wi-Fi CSI Structure (esp_wifi_types.h)
typedef struct {
    unsigned first_word_invalid:1;
    unsigned buf_len:15;
    unsigned rx_ctrl_rssi:8;
    unsigned rx_ctrl_rate:8;
    unsigned rx_ctrl_sig_mode:2;
    unsigned rx_ctrl_mcs:7;
    unsigned rx_ctrl_cbandwidth:1;
    unsigned rx_ctrl_smoothing:1;
    unsigned rx_ctrl_not_sounding:1;
    unsigned rx_ctrl_aggregation:1;
    unsigned rx_ctrl_stbc:2;
    unsigned rx_ctrl_fec_coding:1;
    unsigned rx_ctrl_sgi:1;
    unsigned rx_ctrl_rx_state:8;
    unsigned rx_ctrl_noise_floor:8;
    unsigned rx_ctrl_ampdu_cnt:8;
    unsigned rx_ctrl_channel:4;
    unsigned rx_ctrl_secondary_channel:4;
    unsigned rx_ctrl_timestamp:32;
    unsigned rx_ctrl_ant:1;
    unsigned rx_ctrl_sig_len:12;
    unsigned rx_ctrl_rx_len:12;
    int8_t *buf;
} hegema_wifi_csi_info_t;

bool hegema_csi_init();
void hegema_csi_disable();
bool hegema_csi_is_active();
String hegema_csi_get_latest_json();

#ifdef __cplusplus
}
#endif

#endif // HEGEMA_CSI_CAPTURE_H
