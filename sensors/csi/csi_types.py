"""
HEGEMA Wi-Fi CSI Sensor Plugin - Data Models & Types
Defines raw CSI observations, subcarrier structures, and engineered feature vectors.
Pure Python dataclasses for zero-dependency execution.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False


@dataclass
class CSIObservation:
    """Raw Channel State Information observation received from ESP32 node."""
    timestamp: str = "2026-08-12T12:00:00Z"
    node_id: str = "esp32-csi-01"
    sequence_number: int = 0
    source_mac: str = "00:00:00:00:00:00"
    channel: int = 6
    bandwidth: int = 20
    rssi: int = -65
    noise_floor: int = -95
    subcarrier_count: int = 64
    subcarrier_amplitudes: List[float] = field(default_factory=list)
    subcarrier_phases: List[float] = field(default_factory=list)
    first_word_invalid: bool = False
    packet_rate: float = 40.0
    quality_score: float = 0.9
    data_source: str = "HARDWARE"

    def dict(self) -> Dict[str, Any]:
        """Returns dictionary representation."""
        return {
            "timestamp": self.timestamp,
            "node_id": self.node_id,
            "sequence_number": self.sequence_number,
            "source_mac": self.source_mac,
            "channel": self.channel,
            "bandwidth": self.bandwidth,
            "rssi": self.rssi,
            "noise_floor": self.noise_floor,
            "subcarrier_count": self.subcarrier_count,
            "subcarrier_amplitudes": self.subcarrier_amplitudes,
            "subcarrier_phases": self.subcarrier_phases,
            "first_word_invalid": self.first_word_invalid,
            "packet_rate": self.packet_rate,
            "quality_score": self.quality_score,
            "data_source": self.data_source
        }


@dataclass
class CSIFeatureVector:
    """Engineered feature vector extracted from a temporal sliding window of CSI observations."""
    timestamp: str
    node_id: str
    amplitude_mean: float = 0.0
    amplitude_std: float = 0.0
    amplitude_variance: float = 0.0
    amplitude_range: float = 0.0
    temporal_variance: float = 0.0
    temporal_energy: float = 0.0
    packet_rate: float = 0.0
    amplitude_entropy: float = 0.0
    subcarrier_std_mean: float = 0.0
    phase_sanitized_std: float = 0.0
    doppler_proxy: float = 0.0
    quality_score: float = 0.0

    def to_dict(self) -> Dict[str, float]:
        """Returns dictionary representation of normalized feature vector."""
        return {
            "amplitude_mean": round(self.amplitude_mean, 4),
            "amplitude_std": round(self.amplitude_std, 4),
            "amplitude_variance": round(self.amplitude_variance, 4),
            "amplitude_range": round(self.amplitude_range, 4),
            "temporal_variance": round(self.temporal_variance, 4),
            "temporal_energy": round(self.temporal_energy, 4),
            "packet_rate": round(self.packet_rate, 4),
            "amplitude_entropy": round(self.amplitude_entropy, 4),
            "subcarrier_std_mean": round(self.subcarrier_std_mean, 4),
            "phase_sanitized_std": round(self.phase_sanitized_std, 4),
            "doppler_proxy": round(self.doppler_proxy, 4),
            "quality_score": round(self.quality_score, 4),
        }
