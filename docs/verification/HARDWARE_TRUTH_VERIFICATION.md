# HEGEMA Hardware Truth & Zero Fabrication Verification Report

---

## Executive Summary

This document verifies the strict 3-mode system state architecture (`OFFLINE`, `REAL`, `SIMULATION`) implemented in HEGEMA. It guarantees that NO synthetic or mock telemetry is fabricated when physical hardware is disconnected.

---

## 1. System Mode Definitions

- **OFFLINE (Default Startup Mode)**:
  - ESP32 Nodes: 0
  - Android Devices: 0
  - CSI Nodes: 0
  - Packets/min: 0
  - AI Inferences: 0
  - Confidence: `—`
  - Floorplan Overlay: `NO LIVE SENSOR DATA — Connect ESP32 to begin real-time sensing`
- **REAL**:
  - Activated ONLY when verified physical ESP32/Android heartbeat/telemetry arrives within the `10.0s` timeout.
  - Header Badge: `🟢 REAL HARDWARE`
- **SIMULATION**:
  - Activated ONLY when operator explicitly clicks **Start Simulation**.
  - Displays persistent header watermark: `⚠ SIMULATION MODE ACTIVE — SYNTHETIC TELEMETRY`.
  - Disabling simulation returns system immediately to `OFFLINE`.

---

## 2. Verification Test Matrix

| Scenario | Tested Condition | Expected Result | Result |
| :--- | :--- | :--- | :--- |
| **Test 1** | Application startup with no hardware | Mode = `OFFLINE`, 0 nodes, 0 packets, Confidence = `—` | **PASS** |
| **Test 2** | MQTT online, ESP32 disconnected | MQTT = `ONLINE`, ESP32 = `OFFLINE` | **PASS** |
| **Test 3** | ESP32 heartbeat received | Node = `ONLINE`, Mode = `REAL` | **PASS** |
| **Test 4** | ESP32 heartbeat timeout (>10s) | Node = `OFFLINE`, Mode = `OFFLINE` | **PASS** |
| **Test 5** | Operator clicks Start Simulation | Mode = `SIMULATION`, Watermark = `ACTIVE` | **PASS** |
| **Test 6** | Operator clicks Stop Simulation | Mode = `OFFLINE`, Floorplan = `EMPTY` | **PASS** |
| **Test 7** | System restart | Default Mode = `OFFLINE` | **PASS** |
| **Test 8** | LangGraph Orchestrator | Provenance tracking preserved | **PASS** |
| **Test 9** | Data Lake Ingestion | Mode & Source tagged in log | **PASS** |
| **Test 10**| Zero Fabrication Rule | 0 fabricated packets in OFFLINE | **PASS** |
