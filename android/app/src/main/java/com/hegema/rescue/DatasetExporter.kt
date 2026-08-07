package com.hegema.rescue

import java.io.File
import java.io.FileWriter
import java.io.FileOutputStream
import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream

class DatasetExporter(private val baseDir: File) {

    fun exportMission(
        metadata: MissionMetadata,
        frames: List<SensorSnapshotFrame>
    ): File {
        val missionDirName = "mission_${metadata.missionName.replace(" ", "_").lowercase()}"
        val missionDir = File(baseDir, missionDirName)
        if (!missionDir.exists()) {
            missionDir.mkdirs()
        }

        // 1. Write sensor.csv
        val csvFile = File(missionDir, "sensor.csv")
        FileWriter(csvFile).use { writer ->
            writer.append("timestamp,wifi_ssid,wifi_bssid,wifi_rssi,wifi_freq,ble_mac,ble_rssi,audio_rms,audio_zcr,audio_mfcc1,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,room,people,movement,scenario,door\n")
            for (frame in frames) {
                writer.append("${frame.timestamp},${frame.wifiSsid},${frame.wifiBssid},${frame.wifiRssi},${frame.wifiFreq},${frame.bleMac},${frame.bleRssi},${frame.audioRms},${frame.audioZcr},${frame.audioMfcc1},${frame.accelX},${frame.accelY},${frame.accelZ},${frame.gyroX},${frame.gyroY},${frame.gyroZ},${frame.groundTruthRoom},${frame.groundTruthPeople},${frame.groundTruthMovement},${frame.groundTruthScenario},${frame.groundTruthDoor}\n")
            }
        }

        // 2. Write metadata.json
        val jsonFile = File(missionDir, "metadata.json")
        jsonFile.writeText(
            """
            {
              "mission_name": "${metadata.missionName}",
              "building": "${metadata.building}",
              "floor": "${metadata.floor}",
              "room": "${metadata.room}",
              "scenario": "${metadata.scenario}",
              "num_people": ${metadata.numPeople},
              "movement_state": "${metadata.movementState}",
              "door_state": "${metadata.doorState}",
              "phone_position": "${metadata.phonePosition}",
              "esp32_id": "${metadata.esp32NodeId}",
              "total_frames": ${frames.size}
            }
            """.trimIndent()
        )

        // 3. Write notes.txt
        val notesFile = File(missionDir, "notes.txt")
        notesFile.writeText("HEGEMA Dataset v1 Mission Record\n${metadata.notes}\nTotal Frames Captured: ${frames.size}\n")

        // 4. Create Export ZIP Package
        val zipFile = File(baseDir, "${missionDirName}.zip")
        ZipOutputStream(FileOutputStream(zipFile)).use { zipOut ->
            listOf(csvFile, jsonFile, notesFile).forEach { file ->
                zipOut.putNextEntry(ZipEntry("${missionDirName}/${file.name}"))
                file.inputStream().use { input -> input.copyTo(zipOut) }
                zipOut.closeEntry()
            }
        }

        return zipFile
    }
}
