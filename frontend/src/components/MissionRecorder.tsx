'use client';

import React, { useState } from 'react'

interface MissionRecorderProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
}

export default function MissionRecorder({ systemMode = 'OFFLINE' }: MissionRecorderProps) {
  const [recording, setRecording] = useState(false)
  const isOffline = systemMode === 'OFFLINE'

  const handleToggleRecord = async () => {
    if (isOffline) {
      alert('Cannot start recording when system is OFFLINE. Connect physical hardware or enable Simulation mode.')
      return
    }
    if (recording) {
      try {
        await fetch('http://localhost:8000/api/v1/missions/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mission_name: 'mission_session', total_samples: 100 })
        })
        setRecording(false)
        alert('Mission recording saved to Data Lake!')
      } catch (e) {
        setRecording(false)
      }
    } else {
      setRecording(true)
    }
  }

  return (
    <div className="neu-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Mission Recorder</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>Data Lake Telemetry Logger</div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800,
          background: recording ? '#FEE2E2' : '#F1F5F9',
          color: recording ? '#DC2626' : '#64748B',
          border: recording ? '1px solid #FCA5A5' : '1px solid #E2E8F0'
        }}>
          {recording ? '● RECORDING' : (isOffline ? 'WAITING FOR HARDWARE' : 'IDLE')}
        </span>
      </div>

      <p style={{ fontSize: 11, color: '#64748B', margin: '0 0 14px 0', lineHeight: 1.5 }}>
        {isOffline 
          ? 'Hardware is OFFLINE. Recording will activate when physical ESP32 or simulation stream is active.'
          : 'Records synchronized telemetry frames to data_lake/missions/ for dataset export and model training.'}
      </p>

      <button
        onClick={handleToggleRecord}
        className="btn-primary"
        style={{
          width: '100%', padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 800,
          background: recording ? '#DC2626' : (isOffline ? '#94A3B8' : '#4F8CFF'),
          cursor: isOffline ? 'not-allowed' : 'pointer'
        }}
      >
        {recording ? 'Stop & Save Recording' : 'Start Mission Recording'}
      </button>
    </div>
  )
}
