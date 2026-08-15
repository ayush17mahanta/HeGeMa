"""
HEGEMA Wi-Fi CSI Feature Extractor
Extracts 11 explainable features from sliding windows of preprocessed CSI subcarrier observations.
"""

import math
from typing import List
from sensors.csi.csi_types import CSIObservation, CSIFeatureVector
from sensors.csi.csi_preprocessor import CSIPreprocessor


class CSIFeatureExtractor:
    """Extracts scientific, explainable CSI feature vectors from temporal sliding windows."""

    def __init__(self, preprocessor: Optional[CSIPreprocessor] = None):
        self.preprocessor = preprocessor or CSIPreprocessor()

    def extract_features(self, window: List[CSIObservation]) -> CSIFeatureVector:
        """
        Extracts CSIFeatureVector from a temporal window of CSIObservations (e.g. W = 20..50 frames).
        """
        if not window:
            return CSIFeatureVector(timestamp="", node_id="unknown")

        latest_obs = window[-1]
        node_id = latest_obs.node_id
        timestamp = latest_obs.timestamp

        # Preprocess each observation in the window
        preprocessed_window = [self.preprocessor.preprocess_observation(obs) for obs in window]

        all_clean_amps = [amps for amps, _ in preprocessed_window if amps]
        all_clean_phases = [phases for _, phases in preprocessed_window if phases]

        if not all_clean_amps:
            return CSIFeatureVector(timestamp=timestamp, node_id=node_id)

        num_subcarriers = len(all_clean_amps[0])
        num_frames = len(all_clean_amps)

        # 1. Per-frame mean amplitudes across subcarriers
        frame_means = [sum(amps) / len(amps) if amps else 0.0 for amps in all_clean_amps]
        amplitude_mean = sum(frame_means) / len(frame_means)

        # 2. Amplitude Variance & Standard Deviation across temporal window
        amp_var = sum((m - amplitude_mean) ** 2 for m in frame_means) / num_frames if num_frames > 1 else 0.0
        amp_std = math.sqrt(amp_var)

        # 3. Amplitude Range
        flattened_amps = [a for amps in all_clean_amps for a in amps]
        amp_range = (max(flattened_amps) - min(flattened_amps)) if flattened_amps else 0.0

        # 4. Temporal Variance & Temporal Energy
        temp_var = amp_var  # temporal variance of frame mean amplitudes
        temp_energy = sum(m ** 2 for m in frame_means) / num_frames if num_frames > 0 else 0.0

        # 5. Amplitude Entropy (Shannon Entropy of subcarrier amplitude distribution)
        amp_entropy = self._calculate_shannon_entropy(flattened_amps)

        # 6. Subcarrier Standard Deviation Mean
        subcarrier_stds = []
        for sc_idx in range(num_subcarriers):
            sc_vals = [all_clean_amps[f][sc_idx] for f in range(num_frames) if sc_idx < len(all_clean_amps[f])]
            if len(sc_vals) > 1:
                sc_mean = sum(sc_vals) / len(sc_vals)
                sc_var = sum((v - sc_mean) ** 2 for v in sc_vals) / len(sc_vals)
                subcarrier_stds.append(math.sqrt(sc_var))
        subcarrier_std_mean = sum(subcarrier_stds) / len(subcarrier_stds) if subcarrier_stds else 0.0

        # 7. Sanitized Phase Standard Deviation
        flattened_phases = [p for phases in all_clean_phases for p in phases]
        phase_std = 0.0
        if len(flattened_phases) > 1:
            p_mean = sum(flattened_phases) / len(flattened_phases)
            p_var = sum((p - p_mean) ** 2 for p in flattened_phases) / len(flattened_phases)
            phase_std = math.sqrt(p_var)

        # 8. Doppler Shift Proxy (High-frequency temporal variation across consecutive frames)
        doppler_proxy = 0.0
        if num_frames > 1:
            diffs = [abs(frame_means[i] - frame_means[i - 1]) for i in range(1, num_frames)]
            doppler_proxy = sum(diffs) / len(diffs)

        # 9. Packet Rate & Quality Score
        avg_packet_rate = sum(obs.packet_rate for obs in window) / num_frames
        avg_quality = sum(obs.quality_score for obs in window) / num_frames

        return CSIFeatureVector(
            timestamp=timestamp,
            node_id=node_id,
            amplitude_mean=amplitude_mean,
            amplitude_std=amp_std,
            amplitude_variance=amp_var,
            amplitude_range=amp_range,
            temporal_variance=temp_var,
            temporal_energy=temp_energy,
            packet_rate=avg_packet_rate,
            amplitude_entropy=amp_entropy,
            subcarrier_std_mean=subcarrier_std_mean,
            phase_sanitized_std=phase_std,
            doppler_proxy=doppler_proxy,
            quality_score=avg_quality
        )

    def _calculate_shannon_entropy(self, values: List[float], num_bins: int = 10) -> float:
        """Calculates Shannon entropy of continuous values via histogram binning."""
        if not values or len(values) < 2:
            return 0.0

        min_v, max_v = min(values), max(values)
        if min_v == max_v:
            return 0.0

        bin_width = (max_v - min_v) / num_bins
        counts = [0] * num_bins

        for v in values:
            bin_idx = int((v - min_v) / bin_width)
            bin_idx = min(num_bins - 1, max(0, bin_idx))
            counts[bin_idx] += 1

        total = len(values)
        entropy = 0.0
        for count in counts:
            if count > 0:
                p = count / total
                entropy -= p * math.log2(p)

        return entropy
