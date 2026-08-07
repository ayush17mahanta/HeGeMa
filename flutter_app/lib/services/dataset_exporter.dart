import 'dart:io';
import 'dart:convert';
import '../models/mission_metadata.dart';

class DatasetExporter {
  Future<String> exportMission(
    Directory baseDir,
    MissionMetadata meta,
    List<SensorSnapshotFrame> frames,
  ) async {
    final folderName = "mission_${meta.missionName.replaceAll(' ', '_').toLowerCase()}";
    final missionDir = Directory("${baseDir.path}/$folderName");
    if (!await missionDir.exists()) {
      await missionDir.create(recursive: true);
    }

    // 1. Write sensor.csv
    final csvFile = File("${missionDir.path}/sensor.csv");
    final sink = csvFile.openWrite();
    sink.writeln("timestamp,wifi_ssid,wifi_bssid,wifi_rssi,wifi_freq,ble_mac,ble_rssi,audio_rms,audio_zcr,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,room,people,movement,scenario,door");
    for (var f in frames) {
      sink.writeln(f.toCsvLine());
    }
    await sink.close();

    // 2. Write metadata.json
    final jsonFile = File("${missionDir.path}/metadata.json");
    await jsonFile.writeAsString(jsonEncode(meta.toJson()));

    // 3. Write notes.txt
    final notesFile = File("${missionDir.path}/notes.txt");
    await notesFile.writeAsString("HEGEMA Flutter Dataset v1\n${meta.notes}\nTotal Frames: ${frames.length}\n");

    return missionDir.path;
  }
}
