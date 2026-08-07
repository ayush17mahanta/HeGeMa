# Testing Bible — HEGEMA
**Testing Strategy, QA Automation, HAL Stubs & Simulation Tests**

---

## 1. Test Layers & Scope
1. **Unit Tests**:
   - Backend HAL Driver normalization tests (`pytest tests/test_hal.py`).
   - AI Feature Extractor & Model Zoo prediction tests (`pytest tests/test_ai_zoo.py`).
   - Pydantic schema validation tests (`pytest tests/test_schemas.py`).
2. **Integration Tests**:
   - FastAPI REST endpoint tests with HTTPX test client.
   - MQTT message ingestion to WebSocket broadcast pipeline tests.
3. **Frontend Component & Build Verification**:
   - Jest unit tests for Canvas color grid utilities.
   - Zero-error Next.js production build (`npm run build`).
4. **Simulator Automated Tests**:
   - Verification of simulated survivor path generation and timeline replay player.

## 2. Sample Pytest Verification Script
```python
def test_hal_feature_vector_normalization():
    driver = SimulatorHALDriver()
    raw_data = {"wifi_rssi": -60.0, "ble_rssi": -70.0, "audio_db": 50.0, "imu_mag": 0.2}
    vector = driver.normalize_feature_vector(raw_data)
    assert len(vector) == 5
    assert 0.0 <= vector[0] <= 1.0 # Normalized range test
```
