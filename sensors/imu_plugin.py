from typing import Dict, Any

class IMUAdapter:
    """
    IMU Accelerometer / Gyroscope Feature Adapter.
    Extracts normalized linear acceleration magnitude and gyroscope angular velocity.
    """
    @staticmethod
    def extract_features(raw_data: Dict[str, Any]) -> Dict[str, float]:
        mag = raw_data.get("imu_acceleration_mag", raw_data.get("accel_mag", 0.0))
        norm_accel = min(1.0, float(mag) / 5.0)
        gyro = raw_data.get("gyro_mag", 0.05)
        norm_gyro = min(1.0, float(gyro) / 5.0)
        return {
            "accel_mag_norm": round(norm_accel, 4),
            "gyro_mag_norm": round(norm_gyro, 4),
            "status": "AVAILABLE"
        }
