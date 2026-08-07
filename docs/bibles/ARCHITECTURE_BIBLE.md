# Architecture Bible — HEGEMA
**Master Technical Design Document (TDD) & System Blueprint**

---

## 1. System Design Principles
- **Hardware Abstraction**: All physical and virtual sensors interact via the Hardware Abstraction Layer (HAL).
- **Sensor-Agnostic AI**: Machine learning models consume normalized `Feature Vectors` rather than raw protocol data.
- **Fail-Safe & Offline-First**: System runs entirely on edge hardware (laptop) without cloud connectivity.
- **Explainable Operations**: AI outputs include feature attribution metrics and confidence scores for emergency responders.

## 2. High-Level Data Flow Diagram

```text
[ Physical Nodes ] ---> [ HAL Driver Layer ] ---> [ Feature Normalizer ]
(ESP32 / Android)                                       |
                                                        v
[ Digital Twin ] <--- [ Heatmap Stream ] <--- [ AI Model Zoo Engine ]
(Canvas Dashboard)                                (XAI Attributions)
```

## 3. Core Class & Interface Specification

### `HALBaseDriver` (`hardware/base_driver.py`)
```python
from abc import ABC, abstractmethod
from typing import Dict, Any

class HALBaseDriver(ABC):
    @abstractmethod
    async def connect(self) -> bool:
        pass

    @abstractmethod
    async def read_raw_telemetry(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def normalize_feature_vector(self, raw_data: Dict[str, Any]) -> list[float]:
        pass
```

## 4. Architectural Decisions & Trade-Offs
- **FastAPI + Async Python over Synchronous Django**: Selected for low-latency WebSocket broadcasting and native async MQTT ingestion.
- **HTML5 Canvas over Pure WebGL for 2D Maps**: Selected for maximum cross-device compatibility and lower client CPU overhead while maintaining 60 FPS rendering.
