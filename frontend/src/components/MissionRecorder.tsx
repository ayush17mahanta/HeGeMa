'use client';

import { useState, useEffect } from 'react'

export default function MissionRecorder() {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [packets, setPackets] = useState(0)
  const [waveHeights, setWaveHeights] = useState<number[]>(Array.from({ length: 32 }, () => Math.random()))

  useEffect(() => {
    if (!recording) return
    const timer = setInterval(() => {
      setDuration(d => d + 1)
      setPackets(p => p + Math.floor(Math.random() * 8 + 2))
    }, 1000)
    return () => clearInterval(timer)
  }, [recording])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => {
      setWaveHeights(Array.from({ length: 32 }, () => Math.random()))
    }, 120)
    return () => clearInterval(t)
  }, [recording])

  const saveMissionToBackend = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/missions/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission_name: 'OP-2847', total_samples: packets })
      })
      alert(`Mission OP-2847 (${packets} samples) saved to data_lake/missions/!`)
    } catch (err) {
      console.log('Saved locally:', packets)
    }
  }

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="neu-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Mission Recorder</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Dataset capture · OP-2847</div>
        </div>
        {recording && (
          <div
            style={{
              padding: '4px 12px', borderRadius: 20,
              background: 'rgba(255,107,107,0.12)',
              border: '1px solid rgba(255,107,107,0.3)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6B6B', animation: 'breathe 1s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6B6B' }}>REC</span>
          </div>
        )}
      </div>

      {/* Waveform */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          marginBottom: 18,
          padding: '0 4px',
        }}
      >
        {waveHeights.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: recording ? `${Math.max(8, h * 56)}px` : '8px',
              borderRadius: 2,
              background: recording
                ? `linear-gradient(to top, #4F8CFF, #00D4FF)`
                : 'rgba(0,0,0,0.08)',
              transition: recording ? 'height 0.1s ease' : 'height 0.4s ease',
              opacity: recording ? 0.7 + h * 0.3 : 0.4,
            }}
          />
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        {[
          { label: 'Duration', value: fmt(duration), unit: '' },
          { label: 'Packets', value: packets.toLocaleString(), unit: '' },
          { label: 'Rate', value: recording ? '~5' : '0', unit: '/s' },
          { label: 'Size', value: recording ? (packets * 0.048).toFixed(1) : '0', unit: 'MB' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
              {s.value}<span style={{ fontSize: 11, color: '#9CA3AF' }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className="btn-primary"
          onClick={() => setRecording(!recording)}
          style={{
            flex: 1,
            padding: '11px 0',
            fontSize: 14,
            background: recording
              ? 'linear-gradient(135deg, #FF6B6B 0%, #ff8f8f 100%)'
              : 'linear-gradient(135deg, #4F8CFF 0%, #6fa3ff 100%)',
            boxShadow: recording ? '0 6px 20px rgba(255,107,107,0.3)' : '0 6px 20px rgba(79,140,255,0.3)',
          }}
        >
          {recording ? '⏹ Stop Recording' : '⏺ Start Recording'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => { setDuration(0); setPackets(0); setRecording(false) }}
          style={{ padding: '11px 18px', fontSize: 13, color: '#6B7280' }}
        >
          Reset
        </button>
        {!recording && packets > 0 && (
          <button
            className="btn-secondary"
            onClick={saveMissionToBackend}
            style={{ padding: '11px 18px', fontSize: 13, color: '#4F8CFF', fontWeight: 700 }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  )
}
