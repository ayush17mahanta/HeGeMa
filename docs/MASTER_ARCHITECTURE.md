# HEGEMA — Master System Architecture Specification
**AI-Powered Heatmap Geo Mapping for Disaster Search & Rescue**

---

## Executive Summary & Vision

**HEGEMA** (Heatmap Geo Mapping AI) is an open, modular, AI-assisted disaster response and search-and-rescue (SAR) platform. During structural collapses, earthquakes, fires, or humanitarian crises, traditional GPS fails indoors and optical cameras are blinded by smoke, dust, and rubble. HEGEMA solves this by establishing a **Sensor-Agnostic Probability Heatmap Engine** that fuses signals from authorized wireless nodes (ESP32 Wi-Fi RSSI / BLE), mobile field devices (smartphones measuring acoustic taps, IMU micro-vibrations, and rescue beacons), and optional advanced sensors (Wi-Fi CSI, Radar, Thermal, UWB).

The system generates real-time occupancy probability distributions, confidence metrics (e.g., 92% occupancy probability, 88% confidence), Explainable AI (XAI) feature attributions, and a temporal spatial trajectory timeline (e.g., *Survivor moved from Room 102 → Corridor B → Room 105*).

> [!IMPORTANT]
> **Ethical & Operational Boundary**
> HEGEMA is designed specifically for authorized emergency search-and-rescue deployments. It does **not** claim 100% survivor certainty; rather, it provides emergency first responders with statistical occupancy probability heatmaps to prioritize rescue team entry zones safely and efficiently.

---

## Table of Contents
1. [Vision, Problem Statement, Goals, Stakeholders & Non-Goals](#1-vision-problem-statement-goals-stakeholders--non-goals)
2. [Complete Software Architecture & HAL](#2-complete-software-architecture--hal)
3. [Monorepo & Subsystem Folder Structure](#3-monorepo--subsystem-folder-structure)
4. [Backend Architecture (FastAPI)](#4-backend-architecture-fastapi)
5. [Frontend Architecture (Next.js / React)](#5-frontend-architecture-nextjs--react)
6. [Android Application Architecture](#6-android-application-architecture)
7. [ESP32 Firmware Architecture](#7-esp32-firmware-architecture)
8. [AI Data Collection Pipeline](#8-ai-data-collection-pipeline)
9. [AI Training Pipeline & Model Zoo](#9-ai-training-pipeline--model-zoo)
10. [Database Schema & ER Diagrams](#10-database-schema--er-diagrams)
11. [REST API Specification](#11-rest-api-specification)
12. [WebSocket Real-Time Architecture](#12-websocket-real-time-architecture)
13. [MQTT Communication Architecture](#13-mqtt-communication-architecture)
14. [Authentication & Authorization](#14-authentication--authorization)
15. [Roles & Permissions](#15-roles--permissions)
16. [Dashboard Architecture](#16-dashboard-architecture)
17. [Floor Plan & Heatmap Visualization](#17-floor-plan--heatmap-visualization)
18. [Alert Engine](#18-alert-engine)
19. [AI Inference Engine & Explainable AI (XAI)](#19-ai-inference-engine--explainable-ai-xai)
20. [Logging & Audit Trails](#20-logging--audit-trails)
21. [Error Handling & Resiliency Model](#21-error-handling--resiliency-model)
22. [Security Model](#22-security-model)
23. [Configuration Management](#23-configuration-management)
24. [Docker & Container Architecture](#24-docker--container-architecture)
25. [Deployment Strategy (Edge Node & Cloud Sync)](#25-deployment-strategy-edge-node--cloud-sync)
26. [Testing & QA Strategy](#26-testing--qa-strategy)
27. [Demo Mode, Hackathon Presentation & Scalability Roadmap](#27-demo-mode-hackathon-presentation--scalability-roadmap)

---

## 1. Vision, Problem Statement, Goals, Stakeholders & Non-Goals

### Purpose
To save lives in post-disaster structural environments by equipping Incident Commanders and Rescue Technicians with dynamic, real-time heatmaps of likely survivor locations derived from non-invasive wireless and device sensor telemetry.

### Requirements & Goals
- **Real-Time Sensor Telemetry**: Ingest RSSI, BLE, audio tap counts, and IMU motion streams at up to 10 Hz per sensor node.
- **Hardware Abstraction**: Support heterogeneous hardware (ESP32-WROOM, Android smartphones, simulated nodes) through unified HAL drivers.
- **Offline First & Edge-Capable**: Full standalone functionality on an field command laptop without cloud internet access.
- **Tactical Visual Dashboard**: Render interactive HTML5 Canvas 2D/3D building floor plans with dynamic spatial probability heatmaps.
- **Explainable AI (XAI)**: Show actionable attributions (e.g., *+45% BLE strength, +30% audio tap, +15% RSSI attenuation*).
- **Temporal Movement Timeline**: Track spatial progression over time to detect moving vs. stationary occupants.

### Non-Goals
- Real-time video/camera surveillance.
- Identity tracking or facial recognition.
- Unauthorized public monitoring.

---

## 2. Complete Software Architecture & HAL

```
                      +------------------------------------------+
                      |         FIELD SENSORS & DEVICES          |
                      |  [ESP32 Nodes]  [Android]  [Simulated]   |
                      +--------------------+---------------------+
                                           |
                              MQTT / HTTP / WebSockets
                                           |
                      +--------------------+---------------------+
                      |    HARDWARE ABSTRACTION LAYER (HAL)      |
                      |  Unified Driver Interface & Normalizer   |
                      +--------------------+---------------------+
                                           |
                                 Normalized Feature Vector
                                           |
      +------------------------------------+------------------------------------+
      |                                                                         |
+-----v-----------------------+                                   +-------------v---------------+
|    AI MODEL ZOO ENGINE      |                                   |    DIGITAL TWIN ENGINE      |
|  RF | XGBoost | PyTorch CNN |                                   |  Building Floor Plans &     |
|  XAI Diagnostic Attribution |                                   |  Spatial Occupancy State    |
+-----+-----------------------+                                   +-------------+---------------+
      |                                                                         |
      +------------------------------------+------------------------------------+
                                           |
                               +-----------v-----------+
                               |   FASTAPI CORE HUB    |
                               |  PostGIS + Timescale  |
                               +-----------+-----------+
                                           |
                                    WebSockets API
                                           |
                               +-----------v-----------+
                               |  NEXT.JS DASHBOARD    |
                               |  Canvas 2D/3D Heatmap |
                               |  XAI Timeline Player  |
                               +-----------------------+
```

---

## 3. Monorepo & Subsystem Folder Structure

```text
HEGEMA/
├── backend/                  # FastAPI Core Backend Service
│   ├── app/
│   │   ├── api/              # REST Endpoints (v1)
│   │   ├── core/             # Config, Security, DB session
│   │   ├── models/           # SQLAlchemy DB Models
│   │   ├── schemas/          # Pydantic Schemas
│   │   ├── services/         # Business Logic & Telemetry Handlers
│   │   └── websockets/       # WebSocket Connection Manager & Broadcast
│   ├── main.py
│   └── pyproject.toml
├── frontend/                 # Next.js 14 Dashboard
│   ├── src/
│   │   ├── app/              # App Router Pages (dashboard, simulation, xai)
│   │   ├── components/       # UI Components & Canvas Floor Plan Renderer
│   │   ├── hooks/            # WebSocket & Query Hooks
│   │   ├── lib/              # Utils & Math Helpers
│   │   └── types/            # TypeScript Definitions
│   ├── package.json
│   └── tailwind.config.js
├── android/                  # Android Mobile Field Scanner
│   ├── app/src/main/java/com/hegema/rescue/
│   │   ├── data/             # Sensor Collectors (BLE, Mic, IMU)
│   │   ├── ui/               # Jetpack Compose UI Screens
│   │   └── service/          # Background Scanning Service
│   └── build.gradle.kts
├── esp32/                    # PlatformIO ESP32 Firmware
│   ├── src/
│   │   ├── wifi_sniffer.cpp  # Wi-Fi RSSI / Promiscuous Sniffer
│   │   ├── ble_scanner.cpp   # BLE Beacon Scanner
│   │   ├── mqtt_client.cpp   # MQTT Telemetry Publisher
│   │   └── main.cpp
│   └── platformio.ini
├── hardware/                 # Hardware Abstraction Layer (HAL)
│   ├── base_driver.py        # HAL Base Interface
│   ├── esp32_driver.py       # ESP32 Serial/MQTT Driver
│   ├── android_driver.py     # Android Telemetry Driver
│   └── simulator_driver.py   # Synthetic Sensor Driver
├── ai/                       # AI Engine & Model Zoo
│   ├── feature_vector.py     # Feature Extractor & Normalizer
│   ├── models/               # Random Forest, XGBoost, PyTorch CNN
│   ├── xai/                  # SHAP & Feature Attribution Generator
│   ├── demo/                 # Pre-baked Demo Model Weights
│   └── production/           # Production Model Training Pipeline
├── digital_twin/             # Digital Twin & Floor Plan Engine
│   ├── building_model.py     # DXF/SVG/JSON Floor Plan Parser
│   ├── occupancy_state.py    # Spatial Room Grid State Manager
│   └── replay_engine.py      # Timeline Mission Playback Manager
├── simulation/               # Scenario Generator & Simulation Engine
│   ├── scenario_builder.py   # Earthquake & Structural Collapse Presets
│   ├── target_simulator.py   # Survivor Movement Path Generator
│   └── noise_generator.py    # RF Multi-path & Noise Injector
├── sensors/                  # Modular Sensor Plugins
│   ├── base_plugin.py
│   ├── wifi_plugin.py
│   ├── ble_plugin.py
│   ├── audio_plugin.py
│   └── imu_plugin.py
├── research/                 # Research, Datasets & Benchmarks
│   ├── datasets/             # Synthetic & Synthetic CSI/RSSI Matrix
│   ├── notebooks/            # Model Evaluation & RF Heatmap Notebooks
│   └── benchmarks/           # Model Accuracy & Latency Metrics
├── data_lake/                # Structured Telemetry Data Lake
│   ├── raw_data/             # Ingested JSON & PCAP Telemetry
│   ├── processed/            # Cleaned Feature Matrix Arrays
│   ├── models/               # Model Checkpoints (.pkl, .pt, .onnx)
│   ├── datasets/             # Formatted Training Datasets
│   ├── logs/                 # Telemetry & Audit Logs
│   ├── missions/             # Saved Rescue Mission Sessions
│   └── replays/              # Simulation Replay Files
├── infra/                    # Infrastructure & Docker
│   ├── docker-compose.yml    # Multi-container Compose Blueprint
│   ├── mosquitto/            # MQTT Broker Configuration
│   └── postgres/             # PostGIS Initialization Scripts
├── shared/                   # Shared Schemas & Protocol Specs
│   ├── schemas/              # JSON Schemas for Sensor Telemetry
│   └── constants.py          # Shared System Constants
└── docs/                     # System Specification & 14 Technical Bibles
    ├── MASTER_ARCHITECTURE.md
    └── bibles/
```

---

## 4. Backend Architecture (FastAPI)

FastAPI serves as the core asynchronous API gateway and real-time event hub.
- **Async Architecture**: Uses Python `asyncio` with `asyncpg` for non-blocking database queries.
- **MQTT Bridge**: Background task listens to `hegema/sensors/+/telemetry` MQTT topics and pushes incoming sensor reads to the HAL pipeline.
- **WebSocket Manager**: Maintains client sessions and broadcasts heatmap matrix updates at 5–10 Hz.

---

## 5. Frontend Architecture (Next.js / React)

Next.js 14 App Router provides a responsive, dark-themed tactical mission control dashboard.
- **State Management**: Zustand / React Query for global state and real-time telemetry buffer.
- **Canvas Rendering**: Custom HTML5 Canvas / WebGL engine for 60 FPS floor plan overlays and heatmaps.
- **Components**: Tactical Map, XAI Attribution Drawer, Survivor Confidence Cards, Simulation Control Bar, Timeline Player.

---

## 6. Android Application Architecture

Kotlin application built using Jetpack Compose and Android Architecture Components.
- **Sensor Collector Service**: Runs as a foreground service reading BLE Beacons, Microphone sound levels (dB pressure), and Accelerometer/Gyroscope motion vectors.
- **Offline Caching**: Room DB stores sensor events locally when disconnected; syncs automatically via HTTP/MQTT when reconnected.

---

## 7. ESP32 Firmware Architecture

C++ PlatformIO application written for ESP32.
- **Promiscuous Sniffer**: Captures Wi-Fi management/probe request frames to calculate RSSI per MAC address.
- **BLE Scanner**: Discovers active BLE rescue beacons and smart devices.
- **MQTT Publisher**: Packs telemetry into compact JSON packets sent over Wi-Fi/Ethernet backhaul.

---

## 8. AI Data Collection Pipeline

1. **Sensor Ingestion**: MQTT / HAL receives raw RSSI, BLE RSSI, Audio dB, and IMU data.
2. **Sanitization & Filtering**: Outliers filtered via Kalman Filter / Exponential Moving Average (EMA).
3. **Feature Vector Normalization**: Aggregates signals into a spatial grid matrix:
   $$\vec{F}_{i,j} = [\text{RSSI}_{\text{mean}}, \text{RSSI}_{\text{std}}, \text{BLE}_{\text{max}}, \text{Audio}_{\text{dB}}, \text{Vibration}_{\text{mag}}]$$

---

## 9. AI Training Pipeline & Model Zoo

The AI pipeline is designed around a **Model Zoo**:
- **Random Forest Classifier**: Fast, baseline occupancy probability model.
- **XGBoost Regressor**: High-accuracy spatial density estimator.
- **LightGBM**: Memory-efficient edge model.
- **PyTorch 2D CNN**: Spatial grid heatmap estimation model.
- **Model Comparison Dashboard**: Enables side-by-side accuracy, F1-score, and latency evaluation.

---

## 10. Database Schema & ER Diagrams

Built on **PostgreSQL 16** with **PostGIS** and **TimescaleDB** extensions:
- **`buildings`**: Building metadata and floor plan geometry.
- **`floors`**: Floor plan image/vector data, bounds, and grid dimensions.
- **`sensor_nodes`**: Physical/virtual node locations $(x, y, z)$.
- **`telemetry_events`**: Hypertable storing time-series sensor events.
- **`occupancy_snapshots`**: Predicted probability heatmaps per mission.
- **`rescue_missions`**: Active search-and-rescue mission logs.

---

## 11. REST API Specification

OpenAPI 3.0 compliant endpoints:
- `POST /api/v1/missions/start`: Initialize new search-and-rescue mission.
- `GET /api/v1/floors/{floor_id}/heatmap`: Retrieve current probability matrix.
- `GET /api/v1/ai/xai/{zone_id}`: Retrieve Explainable AI feature attribution.
- `GET /api/v1/models/compare`: Retrieve Model Zoo performance benchmarks.
- `POST /api/v1/simulation/scenario`: Trigger simulated disaster scenario.

---

## 12. WebSocket Real-Time Architecture

Sub-system for streaming low-latency heatmap updates.
- Channel: `/ws/v1/missions/{mission_id}/live`
- Message Types:
  - `HEATMAP_GRID_UPDATE`: Binary float array containing cell occupancy probabilities.
  - `ALERT_TRIGGER`: Urgent survivor confidence alert (>90%).
  - `NODE_HEALTH_STATUS`: Online/offline status of deployed ESP32/Android nodes.

---

## 13. MQTT Communication Architecture

Topic Hierarchy:
- `hegema/nodes/{node_id}/telemetry`: Sensor payload stream.
- `hegema/nodes/{node_id}/status`: Heartbeat & battery telemetry.
- `hegema/nodes/{node_id}/config`: Configuration update directives.

---

## 14. Authentication & Authorization

- **JWT (JSON Web Tokens)**: Short-lived access tokens (HMAC-SHA256) with refresh token rotation.
- **API Keys**: Secure node authentication for ESP32 and Android field scanners.

---

## 15. Roles & Permissions

- **Incident Commander**: Full mission control, scenario simulation, alert management.
- **Field Rescue Tech**: Read-only map access, XAI diagnostics, status markers.
- **System Admin**: Node configuration, model zoo retraining, data lake management.

---

## 16. Dashboard Architecture

Modular Next.js UI containing:
- **Tactical Canvas Viewport**: 2D/3D building floor plan viewer with pan/zoom.
- **Heatmap Layer Control**: Opacity, threshold filtering, and gradient controls.
- **Explainable AI Drawer**: Feature importance breakdown graphs.
- **Movement Timeline Controls**: Playback, pause, scrub timeline (10:00 → 10:05 → 10:10).

---

## 17. Floor Plan & Heatmap Visualization

- Custom HTML5 Canvas 2D engine rendering dual layers:
  1. Base Layer: Building floor plan vectors/walls.
  2. Overlay Layer: Gaussian smoothed probability heatmap derived from AI grid prediction matrix.

---

## 18. Alert Engine

Monitors occupancy probability and generates alerts based on configurable criteria:
- **High Occupancy Alert**: Probability > 85% with high sensor confidence (>80%).
- **Movement Detected**: Spatial zone shift over time windows.
- **Acoustic Tap Pattern**: Rhythmic sound pressure spikes detected by phone mic.

---

## 19. AI Inference Engine & Explainable AI (XAI)

- **Inference Latency**: <50 ms per grid update on laptop CPU/GPU.
- **XAI Engine (SHAP / Feature Attribution)**: Calculates contribution score for each input feature vector element:
  - Example output: `{"BLE_RSSI": +0.42, "WiFi_RSSI": +0.28, "Audio_dB": +0.18, "IMU_Vib": +0.04}`.

---

## 20. Logging & Audit Trails

- Structured JSON logs output to `stdout` and `data_lake/logs/`.
- Every mission interaction, mode change, and alert acknowledgment is recorded with timestamps for post-mission debriefing.

---

## 21. Error Handling & Resiliency Model

- **HAL Driver Fallbacks**: If ESP32 node loses connection, HAL seamlessly transitions to Android or simulated node streams without interrupting heatmap generation.
- **Circuit Breakers**: Prevents cascade failures during high sensor message volume spikes.

---

## 22. Security Model

- **Zero Trust Local Network**: Encrypted payload transmission (TLS / MQTT-over-TLS).
- **Authorized Deployment Boundaries**: Local storage of telemetry; zero external data leakage.

---

## 23. Configuration Management

Centralized environment variables via Pydantic `BaseSettings` (`.env` file driven):
- `HEGEMA_ENV`: `development` | `hackathon_demo` | `production`
- `DATABASE_URL`: Async PostgreSQL connection string.
- `MQTT_BROKER_HOST`: Hostname of local Mosquitto MQTT broker.

---

## 24. Docker & Container Architecture

Multi-container orchestration via `infra/docker-compose.yml`:
- `backend`: FastAPI API server.
- `frontend`: Next.js web application.
- `mqtt_broker`: Eclipse Mosquitto broker.
- `database`: PostgreSQL 16 with PostGIS & TimescaleDB.
- `redis`: Real-time telemetry buffer & Pub/Sub broker.

---

## 25. Deployment Strategy (Edge Node & Cloud Sync)

- **Edge Deployment (Primary)**: Runs directly on Incident Commander's tactical laptop using Docker Desktop or native Python/Node.
- **Cloud Sync (Optional)**: Background worker syncs compressed mission logs to cloud storage once WAN connection is restored.

---

## 26. Testing & QA Strategy

- **Backend Tests**: `pytest` covering API routes, HAL drivers, and AI inference engines.
- **Frontend Tests**: Jest & React Testing Library for UI components and canvas renderer.
- **Simulator Tests**: Automated verification of simulation scenarios (earthquake, survivor movement).

---

## 27. Demo Mode, Hackathon Presentation & Scalability Roadmap

### Hackathon Presentation Mode
- Single-click **"Launch Disaster Scenario"** preset button.
- Pre-populated building floor plan with dynamic moving survivor targets.
- Interactive XAI drawer highlighting multi-sensor feature fusion.
- Replay timeline scrubber demonstrating survivor progression.

### Future Scalability Roadmap
- **Ultra-Wideband (UWB) Sensor Plugin**: Centimeter-accurate positioning plugin.
- **Thermal Imaging Drone Integration**: Aerial thermal heatmap fusion layer.
- **Autonomous Drone Navigation**: Feed probability heatmaps into SAR search path planners.
