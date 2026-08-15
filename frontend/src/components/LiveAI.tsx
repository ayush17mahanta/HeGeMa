'use client';

import React from 'react'

interface LiveAIProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
}

export default function LiveAI({ systemMode = 'OFFLINE' }: LiveAIProps) {
  const isOffline = systemMode === 'OFFLINE'

  const zones = [
    { zone: 'Zone A (Room 301)', status: isOffline ? 'OFFLINE' : 'HOT', conf: isOffline ? 0 : 91, color: isOffline ? '#94A3B8' : '#FF6B6B' },
    { zone: 'Zone B (Room 303)', status: isOffline ? 'OFFLINE' : 'WARM', conf: isOffline ? 0 : 74, color: isOffline ? '#94A3B8' : '#FBBF24' },
    { zone: 'Zone C (Room 302)', status: isOffline ? 'OFFLINE' : 'COOL', conf: isOffline ? 0 : 45, color: isOffline ? '#94A3B8' : '#00D4FF' },
    { zone: 'Zone D (Room 304)', status: isOffline ? 'OFFLINE' : 'WARM', conf: isOffline ? 0 : 62, color: isOffline ? '#94A3B8' : '#FBBF24' },
  ]

  return (
    <div className="neu-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>Live AI Threat & Confidence</div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {isOffline ? 'Inference Engine Idle (No Sensor Data)' : 'Model Zoo Spatial Confidence'}
          </div>
        </div>
        <span style={{
          padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 800,
          background: isOffline ? '#F1F5F9' : '#ECFDF5',
          color: isOffline ? '#94A3B8' : '#059669',
          border: isOffline ? '1px solid #E2E8F0' : '1px solid #A7F3D0'
        }}>
          {isOffline ? 'IDLE' : '87% AVG CONFIDENCE'}
        </span>
      </div>

      {/* Zone Threat List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {zones.map((z) => (
          <div key={z.zone} style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)',
            borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.9)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{z.zone}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>
                {isOffline ? 'No live telemetry' : `Status: ${z.status}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: z.color }}>
                {isOffline ? '—' : `${z.conf}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
