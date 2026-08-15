"""
HEGEMA Synthetic CSI Signal Simulator
Generates realistic 64-subcarrier synthetic CSI packets for testing and UI demo mode.
EXPLICITLY LABELED WITH data_source="SIMULATION".
"""

import time
import math
import random
from typing import Dict, Any, List


class CSISimulator:
    """Simulates 64-subcarrier CSI packet stream for empty room vs human presence scenarios."""

    def __init__(self, node_id: str = "esp32-csi-sim-01"):
        self.node_id = node_id
        self.sequence = 0

    def generate_packet(self, scenario: str = "moving_survivor") -> Dict[str, Any]:
        """
        Generates a synthetic CSIObservation dictionary labeled data_source="SIMULATION".
        """
        self.sequence += 1
        t = time.time()
        subcarrier_count = 64

        # Scenario-dependent subcarrier perturbation
        if scenario == "moving_survivor":
            base_amp = 18.0
            perturbation = 4.5 * math.sin(1.2 * t)
            noise_level = 1.2
            packet_rate = 52.0
            quality = 0.95
        elif scenario == "stationary_person":
            base_amp = 16.0
            perturbation = 1.5 * math.sin(0.3 * t)
            noise_level = 0.5
            packet_rate = 48.0
            quality = 0.92
        else:  # empty_room
            base_amp = 14.0
            perturbation = 0.1 * math.sin(0.1 * t)
            noise_level = 0.1
            packet_rate = 45.0
            quality = 0.98

        amps = []
        phases = []

        for idx in range(subcarrier_count):
            # Subcarrier spatial frequency variation
            sc_freq = math.sin(idx * 0.25)
            amp = base_amp + perturbation * sc_freq + random.gauss(0, noise_level)
            phase = (idx * 0.15 + t * 0.5) % (2 * math.pi)

            amps.append(round(max(0.0, amp), 2))
            phases.append(round(phase, 3))

        return {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "node_id": self.node_id,
            "sequence_number": self.sequence,
            "source_mac": "A4:CF:12:88:99:00",
            "channel": 6,
            "bandwidth": 20,
            "rssi": -61,
            "noise_floor": -95,
            "subcarrier_count": subcarrier_count,
            "subcarrier_amplitudes": amps,
            "subcarrier_phases": phases,
            "first_word_invalid": True,
            "packet_rate": packet_rate,
            "quality_score": quality,
            "data_source": "SIMULATION",
            "scenario": scenario
        }
