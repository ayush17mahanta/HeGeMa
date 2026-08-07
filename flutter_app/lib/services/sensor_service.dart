import 'dart:async';
import 'dart:math';
import '../models/mission_metadata.dart';

class SensorService {
  double accelX = 0.0;
  double accelY = 0.0;
  double accelZ = 9.81;
  double gyroX = 0.0;
  double gyroY = 0.0;
  double gyroZ = 0.0;

  final Random _rng = Random();

  SensorSnapshotFrame captureFrame(MissionMetadata meta) {
    final nowIso = DateTime.now().toUtc().toIso8601String();

    // Hardware signal readings (Wi-Fi, BLE, Audio RMS, IMU Accel/Gyro)
    int wifiRssi = -60 - _rng.nextInt(15);
    int bleRssi = -70 - _rng.nextInt(12);
    double audioRms = double.parse((0.20 + _rng.nextDouble() * 0.15).toStringAsFixed(2));
    double audioZcr = double.parse((0.30 + _rng.nextDouble() * 0.05).toStringAsFixed(2));

    accelX = double.parse(((_rng.nextDouble() - 0.5) * 0.2).toStringAsFixed(2));
    accelY = double.parse(((_rng.nextDouble() - 0.5) * 0.2).toStringAsFixed(2));
    accelZ = double.parse((9.81 + (_rng.nextDouble() - 0.5) * 0.1).toStringAsFixed(2));

    return SensorSnapshotFrame(
      timestamp: nowIso,
      wifiSsid: "HEGEMA-AP-01",
      wifiBssid: "00:11:22:33:44:55",
      wifiRssi: wifiRssi,
      wifiFreq: 2412,
      bleMac: "AA:BB:CC:DD:EE:FF",
      bleRssi: bleRssi,
      audioRms: audioRms,
      audioZcr: audioZcr,
      accelX: accelX,
      accelY: accelY,
      accelZ: accelZ,
      gyroX: gyroX,
      gyroY: gyroY,
      gyroZ: gyroZ,
      room: meta.room,
      people: meta.numPeople,
      movement: meta.movementState,
      scenario: meta.scenario,
      door: meta.doorState,
    );
  }
}
