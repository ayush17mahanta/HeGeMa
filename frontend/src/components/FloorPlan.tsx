'use client';

import { useState, useEffect, useRef } from 'react'

interface Survivor {
  id: number
  x: number
  y: number
  confidence: number
  name: string
  status: 'found' | 'searching' | 'rescued'
  room: string
}

const SURVIVORS: Survivor[] = [
  { id: 1, x: 180, y: 140, confidence: 94, name: 'Survivor A', status: 'found', room: 'Room 301' },
  { id: 2, x: 340, y: 220, confidence: 78, name: 'Survivor B', status: 'searching', room: 'Room 302' },
  { id: 3, x: 490, y: 160, confidence: 87, name: 'Survivor C', status: 'found', room: 'Room 303' },
  { id: 4, x: 260, y: 320, confidence: 61, name: 'Survivor D', status: 'searching', room: 'Room 304' },
]

const ROOMS = [
  { x: 60, y: 80, w: 180, h: 140, label: 'Room 301', heat: 0.9, signals: 'Wi-Fi + BLE + Audio' },
  { x: 260, y: 80, w: 160, h: 120, label: 'Room 302', heat: 0.6, signals: 'BLE + Audio' },
  { x: 440, y: 80, w: 140, h: 160, label: 'Room 303', heat: 0.8, signals: 'Wi-Fi + BLE' },
  { x: 60, y: 240, w: 220, h: 140, label: 'Room 304', heat: 0.5, signals: 'IMU Vibration' },
  { x: 300, y: 220, w: 160, h: 160, label: 'Corridor', heat: 0.3, signals: 'Low Activity' },
  { x: 480, y: 260, w: 120, h: 120, label: 'Stairwell', heat: 0.2, signals: 'Clear' },
]

const ESP32_NODES = [
  { id: 'ESP32_#1', x: 70, y: 90, signal: -61 },
  { id: 'ESP32_#2', x: 270, y: 90, signal: -68 },
  { id: 'ESP32_#3', x: 450, y: 90, signal: -64 },
  { id: 'ESP32_#4', x: 70, y: 250, signal: -72 },
  { id: 'ESP32_#5', x: 310, y: 230, signal: -65 },
  { id: 'ESP32_#6', x: 490, y: 270, signal: -70 },
]

function heatColor(v: number): string {
  if (v > 0.8) return 'rgba(255,107,107,0.38)'
  if (v > 0.6) return 'rgba(251,191,36,0.32)'
  if (v > 0.4) return 'rgba(0,212,255,0.28)'
  return 'rgba(79,140,255,0.18)'
}

function statusColor(s: Survivor['status']): string {
  if (s === 'found') return '#4ADE80'
  if (s === 'rescued') return '#4F8CFF'
  return '#FBBF24'
}

export default function FloorPlan() {
  const [scanAngle, setScanAngle] = useState(0)
  const [survivors, setSurvivors] = useState<Survivor[]>(SURVIVORS)
  const [selected, setSelected] = useState<Survivor | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<typeof ROOMS[0] | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [is3DMode, setIs3DMode] = useState(false)
  const [waveRadius, setWaveRadius] = useState(10)
  const [layerFilter, setLayerFilter] = useState<'all' | 'heatmap' | 'survivors' | 'radar' | 'esp32'>('all')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const t = setInterval(() => {
      setScanAngle(a => (a + 2) % 360)
      setWaveRadius(r => (r >= 35 ? 10 : r + 1))
    }, 30)
    return () => clearInterval(t)
  }, [])

  const handleDispatch = (survivor: Survivor) => {
    alert(`Rescue Team dispatched to ${survivor.name} in ${survivor.room}!`)
  }

  const handleMarkRescued = (survivorId: number) => {
    setSurvivors(prev => prev.map(s => s.id === survivorId ? { ...s, status: 'rescued' } : s))
    if (selected && selected.id === survivorId) {
      setSelected({ ...selected, status: 'rescued' })
    }
  }

  const handleFocusSurvivor = (s: Survivor) => {
    setSelected(s)
    setZoom(1.6)
    setPan({ x: -(s.x - 320) * 0.8, y: -(s.y - 210) * 0.8 })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z + 0.15, 2.8))
    } else {
      setZoom(z => Math.max(z - 0.15, 0.6))
    }
  }

  const radarX = 300, radarY = 200, radarR = 75
  const rad = (scanAngle * Math.PI) / 180
  const lineX = radarX + radarR * Math.cos(rad)
  const lineY = radarY + radarR * Math.sin(rad)

  return (
    <div
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 560,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #edf3ff 0%, #e1ebfd 100%)',
        boxShadow: 'inset -6px -6px 16px rgba(255,255,255,0.9), inset 6px 6px 16px rgba(0,0,0,0.08)',
        perspective: is3DMode ? 1000 : 'none',
      }}
    >
      {/* Top Left Header Controls */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => setIs3DMode(!is3DMode)}
          className="btn-primary ripple-container"
          style={{
            padding: '7px 16px',
            borderRadius: 14,
            fontSize: 11,
            fontWeight: 800,
            background: is3DMode ? 'linear-gradient(135deg, #00D4FF 0%, #4F8CFF 100%)' : 'linear-gradient(135deg, #4F8CFF 0%, #6fa3ff 100%)',
            boxShadow: '0 4px 14px rgba(79,140,255,0.35)',
          }}
        >
          {is3DMode ? '🌐 2D TOP VIEW' : '🏙️ ENTER 3D DIGITAL TWIN'}
        </button>

        {/* Legend */}
        <div
          style={{
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
            borderRadius: 12, padding: '6px 12px', display: 'flex', gap: 10, alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.9)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 800, color: '#6B7280' }}>HEAT:</span>
          {[
            { c: 'rgba(255,107,107,0.7)', l: 'High (Survivor Zone)' },
            { c: 'rgba(251,191,36,0.7)', l: 'Medium' },
            { c: 'rgba(0,212,255,0.6)', l: 'Low' },
          ].map(({ c, l }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
              <span style={{ fontSize: 9, color: '#111827', fontWeight: 600 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Filter Pills */}
      <div style={{ position: 'absolute', top: 16, right: 145, display: 'flex', gap: 6, zIndex: 10 }}>
        {(['all', 'heatmap', 'survivors', 'esp32', 'radar'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLayerFilter(l)}
            style={{
              padding: '5px 12px', borderRadius: 14, border: 'none',
              background: layerFilter === l ? '#4F8CFF' : 'rgba(255,255,255,0.85)',
              color: layerFilter === l ? 'white' : '#6B7280',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 2px 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
        {['+', '−', '⟳'].map((c, i) => (
          <button
            key={i}
            onClick={() => {
              if (c === '+') setZoom(z => Math.min(z + 0.25, 2.8))
              if (c === '−') setZoom(z => Math.max(z - 0.25, 0.5))
              if (c === '⟳') { setZoom(1); setPan({ x: 0, y: 0 }) }
            }}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              boxShadow: '-3px -3px 8px rgba(255,255,255,0.9), 3px 3px 8px rgba(0,0,0,0.08)',
              cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#4F8CFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* SVG Floor Plan */}
      <svg
        ref={svgRef}
        viewBox="0 0 640 420"
        style={{
          width: '100%',
          height: '100%',
          cursor: dragging ? 'grabbing' : 'grab',
          transform: `${is3DMode ? 'rotateX(32deg) rotateZ(-6deg) scale(0.95)' : ''} scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center',
          transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        }}
        onMouseDown={e => {
          setDragging(true)
          setLastPos({ x: e.clientX, y: e.clientY })
        }}
        onMouseMove={e => {
          if (!dragging) return
          setPan(p => ({
            x: p.x + (e.clientX - lastPos.x) / zoom,
            y: p.y + (e.clientY - lastPos.y) / zoom,
          }))
          setLastPos({ x: e.clientX, y: e.clientY })
        }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(79,140,255,0.12)" strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="640" height="420" fill="url(#grid)" />

        {/* Rooms */}
        {(layerFilter === 'all' || layerFilter === 'heatmap') && ROOMS.map((r, i) => (
          <g key={i} onClick={(e) => { e.stopPropagation(); setSelectedRoom(r) }} style={{ cursor: 'pointer' }}>
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h}
              rx={12} ry={12}
              fill={heatColor(r.heat)}
              stroke="rgba(79,140,255,0.3)"
              strokeWidth={1.8}
              style={{ animation: `heatmap-pulse ${2 + i * 0.3}s ease-in-out infinite` }}
            />
            <text
              x={r.x + r.w / 2} y={r.y + 20}
              textAnchor="middle"
              fill="rgba(79,140,255,0.9)"
              fontSize={10}
              fontWeight={800}
              fontFamily="Inter"
              letterSpacing={0.5}
            >
              {r.label.toUpperCase()}
            </text>
          </g>
        ))}

        {/* ESP32 Hardware Sniffer Nodes with Animated Signal Waves ))) */}
        {(layerFilter === 'all' || layerFilter === 'esp32') && ESP32_NODES.map(node => (
          <g key={node.id}>
            {/* Signal wave arcs */}
            <circle cx={node.x} cy={node.y} r={waveRadius} fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth={1} opacity={0.6} />
            <circle cx={node.x} cy={node.y} r={waveRadius * 1.8} fill="none" stroke="rgba(0,212,255,0.2)" strokeWidth={0.8} opacity={0.4} />

            {/* Node Dot */}
            <rect x={node.x - 6} y={node.y - 6} width={12} height={12} rx={3} fill="#00D4FF" filter="url(#glow)" />
            <text x={node.x} y={node.y - 10} textAnchor="middle" fill="#00D4FF" fontSize={7} fontWeight={800}>
              {node.id} ({node.signal}dB)
            </text>
          </g>
        ))}

        {/* Radar Scanner Sweep */}
        {(layerFilter === 'all' || layerFilter === 'radar') && (
          <g>
            <circle cx={radarX} cy={radarY} r={radarR} fill="none" stroke="rgba(0,212,255,0.25)" strokeWidth={1} />
            <circle cx={radarX} cy={radarY} r={radarR * 0.66} fill="none" stroke="rgba(0,212,255,0.18)" strokeWidth={0.8} />
            <circle cx={radarX} cy={radarY} r={radarR * 0.33} fill="none" stroke="rgba(0,212,255,0.12)" strokeWidth={0.8} />

            <path
              d={`M ${radarX} ${radarY} L ${lineX} ${lineY} A ${radarR} ${radarR} 0 0 0 ${radarX + radarR * Math.cos(rad - 0.6)} ${radarY + radarR * Math.sin(rad - 0.6)} Z`}
              fill="rgba(0,212,255,0.18)"
            />
            <line
              x1={radarX} y1={radarY} x2={lineX} y2={lineY}
              stroke="#00D4FF" strokeWidth={1.8}
              filter="url(#glow)"
            />
          </g>
        )}

        {/* Survivors */}
        {(layerFilter === 'all' || layerFilter === 'survivors') && survivors.map(s => (
          <g
            key={s.id}
            onClick={(e) => { e.stopPropagation(); setSelected(sel => sel?.id === s.id ? null : s) }}
            onDoubleClick={(e) => { e.stopPropagation(); handleFocusSurvivor(s) }}
            style={{ cursor: 'pointer' }}
          >
            <circle cx={s.x} cy={s.y} r={16} fill="none" stroke={statusColor(s.status)} strokeWidth={1.5} opacity={0.4}
              style={{ animation: `ping 2s ease-out infinite ${s.id * 0.4}s` }} />
            <circle cx={s.x} cy={s.y} r={11} fill="none" stroke={statusColor(s.status)} strokeWidth={1.5} opacity={0.6}
              style={{ animation: `ping 2s ease-out infinite ${s.id * 0.4 + 0.5}s` }} />
            <circle cx={s.x} cy={s.y} r={8} fill={statusColor(s.status)} filter="url(#glow)"
              style={{ animation: `breathe 2s ease-in-out infinite ${s.id * 0.2}s` }} />
            <circle cx={s.x} cy={s.y} r={3.5} fill="white" />

            <rect x={s.x + 12} y={s.y - 18} width={38} height={15} rx={4} fill={statusColor(s.status)} opacity={0.95} />
            <text x={s.x + 31} y={s.y - 7} textAnchor="middle" fill="white" fontSize={9} fontWeight={800} fontFamily="Inter">
              {s.confidence}%
            </text>
          </g>
        ))}

        {/* Outer walls */}
        <rect x={40} y={60} width={560} height={300} rx={16} ry={16}
          fill="none" stroke="rgba(79,140,255,0.4)" strokeWidth={3} strokeDasharray="10 5" />
      </svg>

      {/* Survivor detail popup */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            right: 18,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: 18,
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '-6px -6px 20px rgba(255,255,255,0.95), 6px 6px 20px rgba(0,0,0,0.1)',
            minWidth: 230,
            animation: 'fade-in 0.3s ease',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColor(selected.status) }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{selected.name}</span>
            <button onClick={() => setSelected(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#9CA3AF' }}>✕</button>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
            Location: <strong style={{ color: '#111827' }}>{selected.room}</strong>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
            Status: <strong style={{ color: statusColor(selected.status), textTransform: 'capitalize' }}>{selected.status}</strong>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Confidence: <strong style={{ color: '#111827' }}>{selected.confidence}%</strong>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleDispatch(selected)}
              className="btn-primary"
              style={{ padding: '7px 12px', fontSize: 11 }}
            >
              Dispatch Rescue Team
            </button>
            {selected.status !== 'rescued' && (
              <button
                onClick={() => handleMarkRescued(selected.id)}
                className="btn-secondary"
                style={{ padding: '7px 12px', fontSize: 11, color: '#4ADE80', fontWeight: 700 }}
              >
                Mark Rescued
              </button>
            )}
          </div>
        </div>
      )}

      {/* Room detail popup */}
      {selectedRoom && !selected && (
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            right: 18,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(16px)',
            borderRadius: 18,
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.9)',
            boxShadow: '-6px -6px 20px rgba(255,255,255,0.95), 6px 6px 20px rgba(0,0,0,0.1)',
            minWidth: 210,
            animation: 'fade-in 0.3s ease',
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: heatColor(selectedRoom.heat) }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{selectedRoom.label}</span>
            <button onClick={() => setSelectedRoom(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: '#9CA3AF' }}>✕</button>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 4 }}>
            Thermal Occupancy Index: <strong style={{ color: '#FF6B6B' }}>{(selectedRoom.heat * 100).toFixed(0)}%</strong>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Detected Sensor Streams: <strong style={{ color: '#4F8CFF' }}>{selectedRoom.signals}</strong>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: '6px 14px',
          border: '1px solid rgba(255,255,255,0.9)',
          fontSize: 11, fontWeight: 800, color: '#4F8CFF',
          letterSpacing: 0.5,
        }}
      >
        BUILDING 7 · FLOOR 3 · {survivors.length} SIGNALS DETECTED · 6 ESP32 NODES ACTIVE
      </div>
    </div>
  )
}
