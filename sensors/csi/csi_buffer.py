"""
HEGEMA Wi-Fi CSI Ring Buffer
Thread-safe circular window buffer for storing CSIObservations and generating sliding feature windows.
"""

import threading
from collections import deque
from typing import List, Optional
from sensors.csi.csi_types import CSIObservation


class CSIRingBuffer:
    """Thread-safe circular ring buffer for temporal CSI packet processing."""

    def __init__(self, capacity: int = 100):
        self.capacity = capacity
        self.buffer = deque(maxlen=capacity)
        self.lock = threading.Lock()

    def add(self, obs: CSIObservation):
        """Appends a new CSIObservation to the ring buffer."""
        with self.lock:
            self.buffer.append(obs)

    def get_window(self, size: int = 20) -> List[CSIObservation]:
        """Returns the most recent 'size' observations."""
        with self.lock:
            n = min(size, len(self.buffer))
            return list(self.buffer)[-n:]

    def clear(self):
        """Clears the ring buffer."""
        with self.lock:
            self.buffer.clear()

    def __len__(self) -> int:
        with self.lock:
            return len(self.buffer)
