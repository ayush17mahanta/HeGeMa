import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'models/mission_metadata.dart';
import 'services/sensor_service.dart';
import 'services/dataset_exporter.dart';

void main() {
  runApp(const HegemaRescueApp());
}

class HegemaRescueApp extends StatelessWidget {
  const HegemaRescueApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HEGEMA Flutter Field Collector',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF4F8CFF),
          secondary: Color(0xFF00D4FF),
          surface: Color(0xFF1E293B),
        ),
      ),
      home: const FieldCollectorScreen(),
    );
  }
}

class FieldCollectorScreen extends StatefulWidget {
  const FieldCollectorScreen({super.key});

  @override
  State<FieldCollectorScreen> createState() => _FieldCollectorScreenState();
}

class _FieldCollectorScreenState extends State<FieldCollectorScreen> {
  final SensorService _sensorService = SensorService();
  final DatasetExporter _exporter = DatasetExporter();
  final MissionMetadata _metadata = MissionMetadata();

  final List<SensorSnapshotFrame> _capturedFrames = [];
  Timer? _recordingTimer;
  bool _isRecording = false;
  bool _isPaused = false;
  String _serverIp = "192.168.1.100";
  SensorSnapshotFrame? _latestFrame;

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _isPaused = false;
    });

    _recordingTimer?.cancel();
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_isRecording && !_isPaused) {
        final frame = _sensorService.captureFrame(_metadata);
        setState(() {
          _capturedFrames.add(frame);
          _latestFrame = frame;
        });

        // Stream live to FastAPI server
        _streamFrameToBackend(frame);
      }
    });
  }

  void _pauseRecording() {
    setState(() {
      _isPaused = !_isPaused;
    });
  }

  void _stopRecording() {
    setState(() {
      _isRecording = false;
      _isPaused = false;
    });
    _recordingTimer?.cancel();
  }

  Future<void> _streamFrameToBackend(SensorSnapshotFrame frame) async {
    try {
      final url = Uri.parse("http://$_serverIp:8000/api/v1/field/ingest");
      await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(frame.toJson()),
      );
    } catch (e) {
      // Backend offline or local fallback
    }
  }

  Future<void> _saveAndExport() async {
    final tempDir = Directory.systemTemp;
    final exportedPath = await _exporter.exportMission(tempDir, _metadata, _capturedFrames);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text("Mission Dataset Exported to: $exportedPath"),
          backgroundColor: const Color(0xFF4ADE80),
        ),
      );
    }
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "HEGEMA Flutter Field Collector",
          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF00D4FF)),
        ),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 4,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Subtitle
            const Text(
              "Synchronized Multi-Sensor (Wi-Fi, BLE, Audio, IMU) Data Collector",
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 16),

            // Status Card
            Card(
              color: const Color(0xFF1E293B),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          _isRecording
                              ? (_isPaused ? "STATUS: PAUSED" : "STATUS: RECORDING MISSION...")
                              : "STATUS: STANDBY",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: _isRecording
                                ? (_isPaused ? const Color(0xFFFBBF24) : const Color(0xFF4ADE80))
                                : Colors.grey,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF4F8CFF).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            "FLUTTER v3",
                            style: const TextStyle(fontSize: 10, color: Color(0xFF4F8CFF), fontWeight: FontWeight.bold),
                          ),
                        )
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      "Frames Captured: ${_capturedFrames.length}",
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Live Telemetry Gauges
            if (_latestFrame != null)
              Card(
                color: const Color(0xFF1E293B),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "Live Synchronized Telemetry",
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF00D4FF)),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Wi-Fi RSSI: ${_latestFrame!.wifiRssi} dBm", style: const TextStyle(color: Colors.white, fontSize: 12)),
                          Text("BLE RSSI: ${_latestFrame!.bleRssi} dBm", style: const TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text("Audio RMS: ${_latestFrame!.audioRms}", style: const TextStyle(color: Colors.white, fontSize: 12)),
                          Text("IMU Accel Z: ${_latestFrame!.accelZ} g", style: const TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

            const SizedBox(height: 16),

            // Control Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _startRecording,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F8CFF)),
                    child: Text(_isRecording ? "RECORDING" : "▶ START"),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isRecording ? _pauseRecording : null,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFBBF24)),
                    child: Text(_isPaused ? "RESUME" : "PAUSE"),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isRecording ? _stopRecording : null,
                    style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF6B6B)),
                    child: const Text("STOP"),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _capturedFrames.isNotEmpty ? _saveAndExport : null,
                icon: const Icon(Icons.archive, color: Colors.black),
                label: const Text("💾 SAVE & EXPORT ZIP PACKAGE", style: TextStyle(color: Colors.black, fontWeight: FontWeight.Bold)),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4ADE80)),
              ),
            ),

            const SizedBox(height: 24),

            // Form Inputs
            Card(
              color: const Color(0xFF1E293B),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Ground Truth Metadata Setup",
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF00D4FF)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      initialValue: _metadata.missionName,
                      decoration: const InputDecoration(labelText: "Mission Name", border: OutlineInputBorder()),
                      onChanged: (v) => _metadata.missionName = v,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: _metadata.building,
                      decoration: const InputDecoration(labelText: "Building", border: OutlineInputBorder()),
                      onChanged: (v) => _metadata.building = v,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: _metadata.room,
                      decoration: const InputDecoration(labelText: "Ground Truth Room Zone", border: OutlineInputBorder()),
                      onChanged: (v) => _metadata.room = v,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: _metadata.scenario,
                      decoration: const InputDecoration(labelText: "Scenario (e.g. Calling_For_Help)", border: OutlineInputBorder()),
                      onChanged: (v) => _metadata.scenario = v,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      initialValue: _serverIp,
                      decoration: const InputDecoration(labelText: "FastAPI Backend Server IP", border: OutlineInputBorder()),
                      onChanged: (v) => _serverIp = v,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
