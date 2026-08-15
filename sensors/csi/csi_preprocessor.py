"""
HEGEMA Wi-Fi CSI Preprocessor
Handles hardware byte masking (ESP32 first_word_invalid quirk), Hampel filtering,
linear phase sanitization, and temporal sliding window formation.
"""

import math
from typing import List, Tuple
from sensors.csi.csi_types import CSIObservation


class CSIPreprocessor:
    """Preprocessing pipeline for raw Wi-Fi CSI subcarriers."""

    def __init__(self, hampel_window: int = 5, hampel_n_sigmas: float = 3.0):
        self.hampel_window = hampel_window
        self.hampel_n_sigmas = hampel_n_sigmas

    def preprocess_observation(self, obs: CSIObservation) -> Tuple[List[float], List[float]]:
        """
        Cleans and sanitizes raw amplitudes and phases from a CSI observation.
        Handles ESP32 first_word_invalid byte masking.
        """
        amps = list(obs.subcarrier_amplitudes)
        phases = list(obs.subcarrier_phases)

        # 1. Mask ESP32 first_word_invalid quirk if present (first 4 subcarrier values)
        if obs.first_word_invalid and len(amps) >= 4:
            # Mask out invalid first 4 subcarrier bytes with median of subsequent subcarriers
            subsequent_median = self._median(amps[4:]) if len(amps) > 4 else 0.0
            for i in range(4):
                amps[i] = subsequent_median
                phases[i] = 0.0

        # 2. Apply Hampel filter to remove impulsive outliers from amplitudes
        clean_amps = self._hampel_filter(amps)

        # 3. Apply linear phase unwrapping & phase sanitization
        clean_phases = self._sanitize_phase(phases)

        return clean_amps, clean_phases

    def _hampel_filter(self, data: List[float]) -> List[float]:
        """Applies Hampel outlier filter using rolling median and MAD."""
        if len(data) < self.hampel_window:
            return data

        filtered = list(data)
        k = self.hampel_window // 2
        n = len(data)

        for i in range(n):
            start = max(0, i - k)
            end = min(n, i + k + 1)
            window = data[start:end]
            med = self._median(window)
            mad = self._median([abs(x - med) for x in window])
            threshold = self.hampel_n_sigmas * 1.4826 * mad

            if threshold > 0 and abs(data[i] - med) > threshold:
                filtered[i] = med

        return filtered

    def _sanitize_phase(self, phases: List[float]) -> List[float]:
        """
        Linear phase sanitization (removes carrier frequency offset & sampling phase offset).
        Unwraps phase angles and fits a linear regression line to subtract slope and offset.
        """
        if not phases or len(phases) < 4:
            return phases

        # Unwrap phase angles
        unwrapped = [phases[0]]
        for i in range(1, len(phases)):
            diff = phases[i] - phases[i - 1]
            while diff > math.pi:
                diff -= 2 * math.pi
            while diff < -math.pi:
                diff += 2 * math.pi
            unwrapped.append(unwrapped[-1] + diff)

        # Fit line: phase = slope * index + offset
        n = len(unwrapped)
        x_mean = (n - 1) / 2.0
        y_mean = sum(unwrapped) / n

        num = sum((i - x_mean) * (unwrapped[i] - y_mean) for i in range(n))
        den = sum((i - x_mean) ** 2 for i in range(n))
        slope = num / den if den != 0 else 0.0
        offset = y_mean - slope * x_mean

        # Subtract linear trend to sanitize phase
        sanitized = [unwrapped[i] - (slope * i + offset) for i in range(n)]
        return sanitized

    @staticmethod
    def _median(data: List[float]) -> float:
        """Helper to calculate median of a list of floats."""
        if not data:
            return 0.0
        s = sorted(data)
        n = len(s)
        mid = n // 2
        if n % 2 == 0:
            return (s[mid - 1] + s[mid]) / 2.0
        return s[mid]
