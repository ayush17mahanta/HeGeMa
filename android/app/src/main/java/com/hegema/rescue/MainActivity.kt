package com.hegema.rescue

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File

class MainActivity : ComponentActivity() {
    private lateinit var sensorCollector: SensorCollectorService
    private var metadata = MissionMetadata()
    private val capturedFrames = mutableListOf<SensorSnapshotFrame>()
    private var isRecording = false
    private var isPaused = false

    private val handler = Handler(Looper.getMainLooper())
    private val recordingRunnable = object : Runnable {
        override fun run() {
            if (isRecording && !isPaused) {
                val frame = sensorCollector.captureSynchronizedFrame(metadata)
                capturedFrames.add(frame)
            }
            handler.postDelayed(this, 1000)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        sensorCollector = SensorCollectorService(this)
        handler.post(recordingRunnable)

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A)
                ) {
                    FieldDataCollectorScreen(
                        metadata = metadata,
                        capturedCount = capturedFrames.size,
                        isRecording = isRecording,
                        isPaused = isPaused,
                        onMetadataChange = { newMeta -> metadata = newMeta },
                        onStart = {
                            isRecording = true
                            isPaused = false
                        },
                        onPause = { isPaused = !isPaused },
                        onStop = {
                            isRecording = false
                            isPaused = false
                        },
                        onSave = {
                            val exporter = DatasetExporter(getExternalFilesDir(null) ?: filesDir)
                            val zip = exporter.exportMission(metadata, capturedFrames)
                            Toast.makeText(this, "Mission Saved: ${zip.name}", Toast.LENGTH_LONG).show()
                        }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        sensorCollector.unregister()
        handler.removeCallbacks(recordingRunnable)
    }
}

@Composable
fun FieldDataCollectorScreen(
    metadata: MissionMetadata,
    capturedCount: Int,
    isRecording: Boolean,
    isPaused: Boolean,
    onMetadataChange: (MissionMetadata) -> Unit,
    onStart: () -> Unit,
    onPause: () -> Unit,
    onStop: () -> Unit,
    onSave: () -> Unit
) {
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header Banner
        Text(
            text = "HEGEMA Field Telemetry & Dataset Collector",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF00D4FF)
        )
        Text(
            text = "Synchronized Wi-Fi + BLE + Audio + IMU + Ground Truth Logger",
            style = MaterialTheme.typography.bodySmall,
            color = Color.LightGray
        )

        // Status Card
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = if (isRecording) (if (isPaused) "STATUS: PAUSED" else "STATUS: RECORDING MISSION...") else "STATUS: STANDBY",
                    color = if (isRecording) (if (isPaused) Color(0xFFFBBF24) else Color(0xFF4ADE80)) else Color.Gray,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Frames Synchronized: $capturedCount",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Recording Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = onStart,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F8CFF)),
                modifier = Modifier.weight(1f)
            ) {
                Text(if (isRecording) "RECORDING" else "▶ START")
            }
            Button(
                onClick = onPause,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFBBF24)),
                modifier = Modifier.weight(1f),
                enabled = isRecording
            ) {
                Text(if (isPaused) "RESUME" else "PAUSE")
            }
            Button(
                onClick = onStop,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF6B6B)),
                modifier = Modifier.weight(1f),
                enabled = isRecording
            ) {
                Text("STOP")
            }
        }

        Button(
            onClick = onSave,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4ADE80)),
            modifier = Modifier.fillMaxWidth(),
            enabled = capturedCount > 0
        ) {
            Text("💾 SAVE & EXPORT ZIP PACKAGE", color = Color.Black, fontWeight = FontWeight.Bold)
        }

        // Ground Truth & Mission Form
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(text = "Ground Truth & Mission Parameters", color = Color(0xFF00D4FF), fontWeight = FontWeight.Bold)

                OutlinedTextField(
                    value = metadata.missionName,
                    onValueChange = { onMetadataChange(metadata.copy(missionName = it)) },
                    label = { Text("Mission Name") },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = metadata.building,
                    onValueChange = { onMetadataChange(metadata.copy(building = it)) },
                    label = { Text("Building") },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = metadata.room,
                    onValueChange = { onMetadataChange(metadata.copy(room = it)) },
                    label = { Text("Room / Ground Truth Zone") },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )

                OutlinedTextField(
                    value = metadata.scenario,
                    onValueChange = { onMetadataChange(metadata.copy(scenario = it)) },
                    label = { Text("Scenario (e.g. Calling_For_Help)") },
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White)
                )
            }
        }
    }
}
