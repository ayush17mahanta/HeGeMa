# Database Bible — HEGEMA
**PostgreSQL, PostGIS Geometry & TimescaleDB Schema Specification**

---

## 1. Relational Schema Architecture

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

-- Building Table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Floors Table
CREATE TABLE floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    floor_plan_svg TEXT,
    grid_rows INT NOT NULL DEFAULT 20,
    grid_cols INT NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor Nodes Table
CREATE TABLE sensor_nodes (
    id VARCHAR(64) PRIMARY KEY,
    floor_id UUID REFERENCES floors(id) ON DELETE CASCADE,
    node_type VARCHAR(32) NOT NULL, -- 'esp32', 'android', 'simulator'
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    status VARCHAR(32) DEFAULT 'active',
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Telemetry Time-Series Hypertable
CREATE TABLE telemetry_events (
    time TIMESTAMPTZ NOT NULL,
    node_id VARCHAR(64) NOT NULL,
    rssi FLOAT,
    ble_count INT,
    audio_db FLOAT,
    imu_mag FLOAT
);

-- Snapshots Table
CREATE TABLE occupancy_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL,
    floor_id UUID REFERENCES floors(id),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grid_matrix JSONB NOT NULL,
    confidence_score FLOAT NOT NULL
);
```
