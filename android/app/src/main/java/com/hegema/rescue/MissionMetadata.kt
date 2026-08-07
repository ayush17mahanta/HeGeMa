package com.hegema.rescue

data class MissionMetadata(
    val missionName: String = "OP-DISASTER-01",
    val building: String = "Building_7",
    val floor: String = "Floor_3",
    val room: String = "Room_301",
    val scenario: String = "Calling_For_Help",
    val numPeople: Int = 2,
    val movementState: String = "Walking",
    val doorState: String = "Closed",
    val phonePosition: String = "Pocket",
    val esp32NodeId: String = "ESP32-NODE-01",
    val notes: String = "Synchronized multi-sensor disaster field recording."
)

data class SensorSnapshotFrame(
    val timestamp: String,
    val wifiSsid: String,
    val wifiBssid: String,
    val wifiRssi: Int,
    val wifiFreq: Int,
    val bleMac: String,
    val bleRssi: Int,
    val audioRms: Float,
    val audioZcr: Float,
    val audioMfcc1: Float,
    val accelX: Float,
    val accelY: Float,
    val accelZ: Float,
    val gyroX: Float,
    val gyroY: Float,
    val gyroZ: Float,
    val groundTruthRoom: String,
    val groundTruthPeople: Int,
    val groundTruthMovement: String,
    val groundTruthScenario: String,
    val groundTruthDoor: String
)
