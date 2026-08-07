package com.hegema.rescue

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SensorCollectorService(private val context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private var accelX = 0.0f
    private var accelY = 0.0f
    private var accelZ = 9.81f
    private var gyroX = 0.0f
    private var gyroY = 0.0f
    private var gyroZ = 0.0f

    init {
        sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
        sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        event?.let {
            when (it.sensor.type) {
                Sensor.TYPE_ACCELEROMETER -> {
                    accelX = it.values[0]
                    accelY = it.values[1]
                    accelZ = it.values[2]
                }
                Sensor.TYPE_GYROSCOPE -> {
                    gyroX = it.values[0]
                    gyroY = it.values[1]
                    gyroZ = it.values[2]
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    fun captureSynchronizedFrame(metadata: MissionMetadata): SensorSnapshotFrame {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        val currentTimestamp = dateFormat.format(Date())

        // Simulated/Hardware sensor readings
        val wifiRssi = -60 - (Math.random() * 15).toInt()
        val bleRssi = -70 - (Math.random() * 12).toInt()
        val audioRms = (0.20f + Math.random() * 0.15f).toFloat()
        val audioZcr = (0.30f + Math.random() * 0.05f).toFloat()
        val audioMfcc1 = (0.50f + Math.random() * 0.10f).toFloat()

        return SensorSnapshotFrame(
            timestamp = currentTimestamp,
            wifiSsid = "HEGEMA-AP-01",
            wifiBssid = "00:11:22:33:44:55",
            wifiRssi = wifiRssi,
            wifiFreq = 2412,
            bleMac = "AA:BB:CC:DD:EE:FF",
            bleRssi = bleRssi,
            audioRms = audioRms,
            audioZcr = audioZcr,
            audioMfcc1 = audioMfcc1,
            accelX = accelX,
            accelY = accelY,
            accelZ = accelZ,
            gyroX = gyroX,
            gyroY = gyroY,
            gyroZ = gyroZ,
            groundTruthRoom = metadata.room,
            groundTruthPeople = metadata.numPeople,
            groundTruthMovement = metadata.movementState,
            groundTruthScenario = metadata.scenario,
            groundTruthDoor = metadata.doorState
        )
    }

    fun unregister() {
        sensorManager?.unregisterListener(this)
    }
}
