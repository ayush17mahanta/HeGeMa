"""
HEGEMA Wi-Fi CSI Transport & Transport Parser
Parses MQTT JSON payloads and HTTP ingest requests into structured CSIObservation objects.
"""

import json
from typing import Dict, Any, Optional
from sensors.csi.csi_types import CSIObservation


class CSITransportParser:
    """Parses node telemetry JSON strings and raw dicts into CSIObservation models."""

    @staticmethod
    def parse_payload(payload: Any) -> Optional[CSIObservation]:
        """Parses a dictionary or JSON string payload into a CSIObservation."""
        if isinstance(payload, (bytes, str)):
            try:
                data = json.loads(payload)
            except Exception:
                return None
        elif isinstance(payload, dict):
            data = payload
        else:
            return None

        try:
            # Handle both raw amplitude arrays and ESP32 struct payloads
            amps = data.get("subcarrier_amplitudes") or data.get("csi_data") or data.get("amplitudes") or []
            phases = data.get("subcarrier_phases") or data.get("phases") or []

            # Ensure numeric conversion
            amps = [float(x) for x in amps]
            phases = [float(x) for x in phases]

            return CSIObservation(
                timestamp=str(data.get("timestamp", "2026-08-12T12:00:00Z")),
                node_id=str(data.get("node_id", "esp32-csi-01")),
                sequence_number=int(data.get("sequence", data.get("sequence_number", 0))),
                source_mac=str(data.get("source_mac", "00:00:00:00:00:00")),
                channel=int(data.get("channel", 6)),
                bandwidth=int(data.get("bandwidth", 20)),
                rssi=int(data.get("rssi", -65)),
                noise_floor=int(data.get("noise_floor", -95)),
                subcarrier_count=len(amps) if amps else int(data.get("subcarrier_count", 64)),
                subcarrier_amplitudes=amps,
                subcarrier_phases=phases,
                first_word_invalid=bool(data.get("first_word_invalid", False)),
                packet_rate=float(data.get("packet_rate", 40.0)),
                quality_score=float(data.get("quality_score", 0.9)),
                data_source=str(data.get("data_source", "HARDWARE")),
            )
        except Exception:
            return None
