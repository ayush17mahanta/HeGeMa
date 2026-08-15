'use client';

import { useState, useEffect, useRef } from 'react'

interface FloorPlanProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
  hardwareCount?: number;
}

interface Survivor {
  id: number
  x: number
  y: number
  confidence: number
  name: string
  status: 'found' | 'searching' | 'rescued'
  room: string
}

const SIMULATED_SURVIVORS: Survivor[] = [
  { id: 1, x: 180, y: 140, confidence: 94, name: 'Survivor A', status: 'found', room: 'Room 301' },
  { id: 2, x: 340, y: 220, confidence: 78, name: 'Survivor B', status: 'searching', room: 'Room 302' },
  { id: 3, x: 490, y: 160, confidence: 87, name: 'Survivor C', status: 'found', room: 'Room 303' },
  { id: 4, x: 260, y: 320, confidence: 61, name: 'Survivor D', status: 'searching', room: 'Room 304' },
]

const ROOMS = [
  { x: 60, y: 80, w: 180, h: 140, label: 'Room 301', heat: 0.9, signals: 'Wi-Fi CSI + RSSI + BLE + Audio', csiProb: 0.88 },
  { x: 260, y: 80, w: 160, h: 120, label: 'Room 302', heat: 0.6, signals: 'BLE + Audio', csiProb: 0.45 },
  { x: 440, y: 80, w: 140, h: 160, label: 'Room 303', heat: 0.8, signals: 'Wi-Fi CSI + BLE', csiProb: 0.82 },
  { x: 60, y: 240, w: 220, h: 140, label: 'Room 304', heat: 0.5, signals: 'IMU Vibration', csiProb: 0.30 },
  { x: 300, y: 220, w: 160, h: 160, label: 'Corridor', heat: 0.3, signals: 'Low Activity', csiProb: 0.15 },
  { x: 480, y: 260, w: 120, h: 120, label: 'Stairwell', heat: 0.2, signals: 'Clear', csiProb: 0.05 },
]

const SIMULATED_NODES = [
  { id: 'ESP32_#1 (CSI)', x: 70, y: 90, signal: -61, csiActive: true },
  { id: 'ESP32_#2', x: 270, y: 90, signal: -68, csiActive: false },
  { id: 'ESP32_#3 (CSI)', x: 450, y: 90, signal: -64, csiActive: true },
  { id: 'ESP32_#4', x: 70, y: 250, signal: -72, csiActive: false },
  { id: 'ESP32_#5', x: 310, y: 230, signal: -65, csiActive: false },
  { id: 'ESP32_#6 (CSI)', x: 490, y: 270, signal: -70, csiActive: true },
]

function heatColor(v: number, isOffline: boolean = false, isCsiOnly: boolean = false): string {
  if (isOffline) return 'rgba(226,232,240,0.15)';
  if (isCsiOnly) {
    if (v > 0.75) return 'rgba(6,182,212,0.45)'
    if (v > 0.40) return 'rgba(14,165,233,0.32)'
    return 'rgba(79,140,255,0.15)'
  }
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

export default function FloorPlan({ systemMode = 'OFFLINE', hardwareCount = 0 }: FloorPlanProps) {
  const [scanAngle, setScanAngle] = useState(0)
  const [survivors, setSurvivors] = useState<Survivor[]>([])
  const [selected, setSelected] = useState<Survivor | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<typeof ROOMS[0] | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [is3DMode, setIs3DMode] = useState(false)
  const [waveRadius, setWaveRadius] = useState(10)
  const [layerFilter, setLayerFilter] = useState<'all' | 'csi' | 'heatmap' | 'survivors' | 'radar' | 'esp32'>('all')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (systemMode === 'SIMULATION') {
      setSurvivors(SIMULATED_SURVIVORS)
    } else {
      setSurvivors([])
    }
  }, [systemMode])

  useEffect(() => {
    if (systemMode === 'OFFLINE') return
    const t = setInterval(() => {
      setScanAngle(a => (a + 2) % 360)
      setWaveRadius(r => (r >= 35 ? 10 : r + 1))
    }, 30)
    return () => clearInterval(t)
  }, [systemMode])

  const isOffline = systemMode === 'OFFLINE'
  const activeNodes = isOffline ? [] : SIMULATED_NODES

  return (
    <div
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
      {/* OFFLINE Professional Empty State Overlay */}
      {isOffline && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 25,
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: '24px 36px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.06)',
            maxWidth: 420
          }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: 20 }}>
              📡
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: -0.5 }}>
              NO LIVE SENSOR DATA
            </h3>
            <p style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.5 }}>
              Connect a physical ESP32 sniffer or click <strong>Start Simulation</strong> to begin real-time spatial sensing.
            </p>
          </div>
        </div>
      )}

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
            { c: layerFilter === 'csi' ? 'rgba(6,182,212,0.8)' : 'rgba(255,107,107,0.7)', l: layerFilter === 'csi' ? 'CSI Strong Evidence' : 'Fused High Priority' },
            { c: 'rgba(251,191,36,0.7)', l: 'Medium' },
            { c: 'rgba(0,212,255,0.6)', l: 'Low' },
          ].map(({ c, l }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: isOffline ? '#CBD5E1' : c }} />
              <span style={{ fontSize: 9, color: '#111827', fontWeight: 600 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Filter Pills */}
      <div style={{ position: 'absolute', top: 16, right: 145, display: 'flex', gap: 6, zIndex: 10 }}>
        {(['all', 'csi', 'heatmap', 'survivors', 'esp32', 'radar'] as const).map(l => (
          <button
            key={l}
            onClick={() => setLayerFilter(l)}
            style={{
              padding: '5px 12px', borderRadius: 14, border: 'none',
              background: layerFilter === l ? (l === 'csi' ? '#06B6D4' : '#4F8CFF') : 'rgba(255,255,255,0.85)',
              color: layerFilter === l ? 'white' : '#6B7280',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '-2px -2px 6px rgba(255,255,255,0.9), 2px 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            {l === 'csi' ? '⚡ CSI LAYER' : l}
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
          transform: `${is3DMode ? 'rotateX(32deg) rotateZ(-6deg) scale(0.95)' : ''} scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.4s cubic-bezier(0.34,1.2,0.64,1)',
        }}
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
        {ROOMS.map((r, i) => (
          <g key={i} onClick={(e) => { e.stopPropagation(); setSelectedRoom(r) }} style={{ cursor: 'pointer' }}>
            <rect
              x={r.x} y={r.y} width={r.w} height={r.h}
              rx={12} ry={12}
              fill={heatColor(r.heat, isOffline, layerFilter === 'csi')}
              stroke={layerFilter === 'csi' ? 'rgba(6,182,212,0.5)' : 'rgba(79,140,255,0.3)'}
              strokeWidth={1.8}
            />
            <text
              x={r.x + r.w / 2} y={r.y + 20}
              textAnchor="middle"
              fill={isOffline ? '#94A3B8' : (layerFilter === 'csi' ? '#0891B2' : 'rgba(79,140,255,0.9)')}
              fontSize={10}
              fontWeight={800}
              fontFamily="Inter"
              letterSpacing={0.5}
            >
              {r.label.toUpperCase()}
            </text>
          </g>
        ))}

        {/* ESP32 Hardware Sniffer Nodes */}
        {!isOffline && (layerFilter === 'all' || layerFilter === 'esp32' || layerFilter === 'csi') && activeNodes.map(node => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={waveRadius} fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth={1} opacity={0.6} />
            <rect x={node.x - 6} y={node.y - 6} width={12} height={12} rx={3} fill="#00D4FF" filter="url(#glow)" />
            <text x={node.x} y={node.y - 10} textAnchor="middle" fill="#00D4FF" fontSize={7} fontWeight={800}>
              {node.id} ({node.signal}dB)
            </text>
          </g>
        ))}

        {/* Survivors */}
        {!isOffline && (layerFilter === 'all' || layerFilter === 'survivors') && survivors.map(s => (
          <g key={s.id} onClick={(e) => { e.stopPropagation(); setSelected(s) }} style={{ cursor: 'pointer' }}>
            <circle cx={s.x} cy={s.y} r={8} fill={statusColor(s.status)} filter="url(#glow)" />
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

      <div
        style={{
          position: 'absolute', bottom: 16, left: 16,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 12, padding: '6px 14px',
          border: '1px solid rgba(255,255,255,0.9)',
          fontSize: 11, fontWeight: 800, color: isOffline ? '#94A3B8' : '#4F8CFF',
          letterSpacing: 0.5,
        }}
      >
        BUILDING 7 · FLOOR 3 · {isOffline ? '0 SIGNALS DETECTED · HARDWARE OFFLINE' : `${survivors.length} SIGNALS DETECTED · ${activeNodes.length} NODES ACTIVE`}
      </div>
    </div>
  )
}
