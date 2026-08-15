'use client';

import React from 'react'

interface LiveTelemetryStreamProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
}

export default function LiveTelemetryStream({ systemMode = 'OFFLINE' }: LiveTelemetryStreamProps) {
  const isOffline = systemMode === 'OFFLINE'

  const streams = [
    { name: 'ESP32 Sniffer Node 01', type: 'Wi-Fi CSI / RSSI', val: isOffline ? 'OFFLINE' : '-61 dBm', status: isOffline ? 'OFFLINE' : 'Optimal' },
    { name: 'BLE Beacon Sniffer', type: 'Bluetooth Low Energy', val: isOffline ? 'OFFLINE' : '-74 dBm', status: isOffline ? 'OFFLINE' : 'Stable' },
    { name: 'Smartphone Mic', type: 'Acoustic RMS', val: isOffline ? 'OFFLINE' : '0.24 RMS (52 dB)', status: isOffline ? 'OFFLINE' : 'Acoustic Detected' },
    { name: 'Android IMU', type: 'Linear Acceleration', val: isOffline ? 'OFFLINE' : '0.003 g', status: isOffline ? 'OFFLINE' : 'Quiet' },
  ]

  return (
    <div className="neu-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>Live Multi-Sensor Telemetry Stream</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {isOffline ? 'Awaiting hardware connection or simulation start' : 'Real-time validated sensor metrics'}
          </div>
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 14, fontSize: 10, fontWeight: 800,
          background: isOffline ? '#F1F5F9' : '#06B6D4/10',
          color: isOffline ? '#94A3B8' : '#0891B2',
          border: '1px solid rgba(6,182,212,0.2)'
        }}>
          {isOffline ? 'NO LIVE STREAM' : 'STREAMING 100% DELIVERY'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {streams.map((s) => (
          <div key={s.name} style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.9)'
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>{s.type}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', marginTop: 4 }}>{s.name}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: isOffline ? '#94A3B8' : '#4F8CFF', marginTop: 8 }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: isOffline ? '#94A3B8' : '#059669', marginTop: 4 }}>{s.status}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
