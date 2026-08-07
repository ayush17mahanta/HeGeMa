'use client';

import { useState } from 'react'

const EVENTS = [
  { id: 1, time: '14:32', type: 'survivor', label: 'Survivor Detected', detail: 'Room 301 · 94% confidence · BLE+Audio', color: '#4ADE80' },
  { id: 2, time: '14:29', type: 'scan', label: 'Zone A4 Cleared', detail: 'No signals · 3 devices scanned', color: '#4F8CFF' },
  { id: 3, time: '14:25', type: 'alert', label: 'CO2 Spike', detail: 'Corridor 3B · 1820 ppm', color: '#FBBF24' },
  { id: 4, time: '14:18', type: 'survivor', label: 'Survivor Confirmed', detail: 'Room 302 · Rescue team dispatched', color: '#4ADE80' },
  { id: 5, time: '14:11', type: 'system', label: 'Mission Started', detail: 'OP-2847 · 6 ESP32 nodes online', color: '#00D4FF' },
]

export default function Timeline() {
  const [selected, setSelected] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const handlePlayReplay = () => {
    setPlaying(true)
    let idx = 0
    const interval = setInterval(() => {
      setSelected(EVENTS[idx].id)
      idx++
      if (idx >= EVENTS.length) {
        clearInterval(interval)
        setPlaying(false)
      }
    }, 1200)
  }

  return (
    <div className="neu-card" style={{ padding: '22px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Mission Timeline & Replay</div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>Live event stream · click event node to inspect</div>
        </div>
        <button
          onClick={handlePlayReplay}
          className="btn-secondary"
          style={{ padding: '6px 16px', fontSize: 12, color: '#4F8CFF', fontWeight: 700 }}
        >
          {playing ? '⏳ Replaying...' : '▶ Replay Sequence'}
        </button>
      </div>

      <div style={{ position: 'relative', overflowX: 'auto', paddingBottom: 8 }}>
        {/* Horizontal timeline line */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, rgba(79,140,255,0.1), rgba(79,140,255,0.3), rgba(0,212,255,0.3), rgba(79,140,255,0.1))',
            borderRadius: 1,
          }}
        />

        <div style={{ display: 'flex', gap: 20, minWidth: 'max-content', paddingTop: 0 }}>
          {EVENTS.map((e, i) => (
            <div
              key={e.id}
              onClick={() => setSelected(selected === e.id ? null : e.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                animation: `fade-in 0.4s ease ${i * 80}ms both`,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: selected === e.id
                    ? `linear-gradient(135deg, ${e.color} 0%, ${e.color}99 100%)`
                    : 'white',
                  border: `2px solid ${e.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: selected === e.id
                    ? `0 6px 20px ${e.color}44`
                    : '-4px -4px 10px rgba(255,255,255,0.9), 4px 4px 10px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                  transform: selected === e.id ? 'scale(1.12)' : 'scale(1)',
                }}
              >
                {e.type === 'survivor' ? '👤' : e.type === 'scan' ? '🔍' : e.type === 'alert' ? '⚠️' : '⚡'}
              </div>

              {/* Time */}
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
                {e.time}
              </div>

              {/* Label */}
              <div style={{ fontSize: 10, color: '#6B7280', marginTop: 2, maxWidth: 88, textAlign: 'center' }}>
                {e.label}
              </div>

              {/* Expanded detail */}
              {selected === e.id && (
                <div
                  style={{
                    marginTop: 8,
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.95)',
                    border: `1px solid ${e.color}55`,
                    boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 8px rgba(0,0,0,0.06)',
                    fontSize: 10,
                    color: '#111827',
                    maxWidth: 140,
                    textAlign: 'center',
                    animation: 'fade-in 0.2s ease',
                    lineHeight: 1.5,
                  }}
                >
                  {e.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
