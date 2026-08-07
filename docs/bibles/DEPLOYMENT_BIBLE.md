# Deployment Bible — HEGEMA
**Tactical Edge Deployment Runbook & Cloud Synchronization**

---

## 1. Tactical Laptop Setup (Field Command)
1. **Prerequisites**:
   - OS: Windows 10/11, macOS, or Ubuntu Linux.
   - Prerequisites: Docker Desktop (or Engine), Python 3.11+, Node.js 18+.
2. **Local Edge Launch**:
   ```bash
   git clone <repo_url> HEGEMA
   cd HEGEMA
   cp .env.example .env
   docker-compose -f infra/docker-compose.yml up -d --build
   ```
3. **Verify Edge Stack**:
   - Backend API Docs: `http://localhost:8000/docs`
   - Next.js Tactical Dashboard: `http://localhost:3000`
   - MQTT Broker: `localhost:1883`

## 2. ESP32 Node Field Flashing
- Open `esp32/` directory in VS Code with PlatformIO extension.
- Update `esp32/src/config.h` with Wi-Fi Backhaul SSID and Laptop IP Address.
- Flash via USB: `pio run --target upload`.

## 3. Optional Cloud Sync Engine
When external internet connectivity is detected by the Edge server, a background worker compresses session logs in `data_lake/missions/` and uploads them to S3/Cloud storage for post-mission debriefing.
