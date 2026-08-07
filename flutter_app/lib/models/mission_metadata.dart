class MissionMetadata {
  String missionName;
  String building;
  String floor;
  String room;
  String scenario;
  int numPeople;
  String movementState;
  String doorState;
  String phonePosition;
  String esp32NodeId;
  String notes;

  MissionMetadata({
    this.missionName = "OP-FLUTTER-DISASTER-01",
    this.building = "Building_7",
    this.floor = "Floor_3",
    this.room = "Room_301",
    this.scenario = "Calling_For_Help",
    this.numPeople = 2,
    this.movementState = "Walking",
    this.doorState = "Closed",
    this.phonePosition = "Pocket",
    this.esp32NodeId = "ESP32-NODE-01",
    this.notes = "Synchronized multi-sensor Flutter field recording.",
  });

  Map<String, dynamic> toJson() => {
        'mission_name': missionName,
        'building': building,
        'floor': floor,
        'room': room,
        'scenario': scenario,
        'num_people': numPeople,
        'movement_state': movementState,
        'door_state': doorState,
        'phone_position': phonePosition,
        'esp32_id': esp32NodeId,
        'notes': notes,
      };
}

class SensorSnapshotFrame {
  final String timestamp;
  final String wifiSsid;
  final String wifiBssid;
  final int wifiRssi;
  final int wifiFreq;
  final String bleMac;
  final int bleRssi;
  final double audioRms;
  final double audioZcr;
  final double accelX;
  final double accelY;
  final double accelZ;
  final double gyroX;
  final double gyroY;
  final double gyroZ;
  final String room;
  final int people;
  final String movement;
  final String scenario;
  final String door;

  SensorSnapshotFrame({
    required this.timestamp,
    required this.wifiSsid,
    required this.wifiBssid,
    required this.wifiRssi,
    required this.wifiFreq,
    required this.bleMac,
    required this.bleRssi,
    required this.audioRms,
    required this.audioZcr,
    required this.accelX,
    required this.accelY,
    required this.accelZ,
    required this.gyroX,
    required this.gyroY,
    required this.gyroZ,
    required this.room,
    required this.people,
    required this.movement,
    required this.scenario,
    required this.door,
  });

  String toCsvLine() {
    return "$timestamp,$wifiSsid,$wifiBssid,$wifiRssi,$wifiFreq,$bleMac,$bleRssi,$audioRms,$audioZcr,$accelX,$accelY,$accelZ,$gyroX,$gyroY,$gyroZ,$room,$people,$movement,$scenario,$door";
  }

  Map<String, dynamic> toJson() => {
        'timestamp': timestamp,
        'wifi_rssi': wifiRssi,
        'ble_rssi': bleRssi,
        'audio_rms': audioRms,
        'audio_zcr': audioZcr,
        'accel_x': accelX,
        'accel_y': accelY,
        'accel_z': accelZ,
        'gyro_x': gyroX,
        'gyro_y': gyroY,
        'gyro_z': gyroZ,
        'room': room,
        'building': 'Building_7',
        'scenario': scenario,
        'num_people': people,
      };
}
