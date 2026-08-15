# HEGEMA CSI Feature Documentation

**Scientific Breakdown of Extracted Wi-Fi CSI Features**

---

## 1. Feature Specifications

| Feature Name | Math Expression / Formulation | Physical Meaning & Purpose | Limitations |
| :--- | :--- | :--- | :--- |
| **amplitude_mean** | $\bar{A} = \frac{1}{N K} \sum_{i=1}^N \sum_{k=1}^K A_{i,k}$ | Overall signal attenuation and multipath energy level | Affected by distance and transmit power |
| **amplitude_std** | $\sigma_A = \sqrt{\frac{1}{N} \sum (\bar{A}_i - \bar{A})^2}$ | Fluctuation magnitude across temporal window | Sensitive to environmental vibration |
| **amplitude_variance** | $\sigma_A^2$ | Energy variation caused by moving scatterers | Scale-dependent |
| **amplitude_range** | $\max(A) - \min(A)$ | Peak disturbance spread | Influenced by noise spikes |
| **temporal_variance** | $\text{Var}_t(\bar{A}_i)$ | Dynamic variance of mean packet amplitudes over time | Requires $W \ge 10$ frames |
| **temporal_energy** | $E_t = \frac{1}{N} \sum \bar{A}_i^2$ | Total subcarrier kinetic signal power | Relative measurement |
| **packet_rate** | $R_{\text{pkt}} = \frac{N}{\Delta t}$ | Throughput sampling frequency (Hz) | Depends on network congestion |
| **amplitude_entropy** | $H = -\sum p_i \log_2(p_i)$ | Distribution complexity of subcarrier amplitudes | Bounded by histogram bin count |
| **subcarrier_std_mean**| $\frac{1}{K} \sum_{k=1}^K \sigma_{A,k}$ | Per-subcarrier frequency selective fading index | Single-antenna frequency resolution limit |
| **phase_sanitized_std**| $\sigma_\phi$ | Unwrapped, linear-sanitized phase variation | Subject to residual phase noise |
| **doppler_proxy** | $D = \frac{1}{N-1} \sum \|\bar{A}_i - \bar{A}_{i-1}\|$ | Frame-to-frame velocity fluctuation proxy | Proxy measurement, not calibrated m/s velocity |
