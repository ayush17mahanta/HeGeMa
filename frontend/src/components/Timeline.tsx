'use client';

import React from 'react'

interface TimelineProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
}

export default function Timeline({ systemMode = 'OFFLINE' }: TimelineProps) {
  const isOffline = systemMode === 'OFFLINE'

  const events = isOffline ? [] : [
    { id: 1, time: '14:32', label: 'Survivor Detected', detail: 'Room 301 · 94% confidence · Wi-Fi+BLE+Audio', color: '#4ADE80' },
    { id: 2, time: '14:29', label: 'Acoustic Signal Match', detail: 'Room 301 · Tap pattern recognized', color: '#00D4FF' },
    { id: 3, time: '14:25', label: 'CSI Subcarrier Disturbance', detail: 'Room 303 · High temporal variance', color: '#A78BFA' },
    { id: 4, time: '14:18', label: 'Telemetry Session Active', detail: 'Building 7 Floor 3 mesh connected', color: '#FBBF24' },
  ]

  return (
    <div className="neu-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Mission Audit Timeline</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>Timestamped event log</div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: isOffline ? '#94A3B8' : '#4F8CFF' }}>
          {isOffline ? 'NO LIVE MISSION EVENTS' : `${events.length} EVENTS LOGGED`}
        </span>
      </div>

      {isOffline ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.8)' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#64748B' }}>NO MISSION EVENTS LOGGED</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#94A3B8' }}>Events will record when physical hardware or simulation is active.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map((ev) => (
            <div key={ev.id} style={{
              display: 'flex', gap: 12, alignItems: 'center',
              background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '10px 14px'
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#4F8CFF', fontVariantNumeric: 'tabular-nums' }}>{ev.time}</div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.color }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{ev.label}</div>
                <div style={{ fontSize: 10, color: '#6B7280' }}>{ev.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
