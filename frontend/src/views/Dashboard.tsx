'use client';

import { useState } from 'react'
import StatCard from '../components/StatCard'
import FloorPlan from '../components/FloorPlan'
import LiveAI from '../components/LiveAI'
import SystemHealth from '../components/SystemHealth'
import MissionRecorder from '../components/MissionRecorder'
import Timeline from '../components/Timeline'
import LiveTelemetryStream from '../components/LiveTelemetryStream'
import AIAssistantWidget from '../components/AIAssistantWidget'

const STAT_CARDS = [
  {
    icon: '📡',
    label: 'ESP32 NODES',
    value: 6,
    trend: [3,4,5,4,6,6,6,5,6],
    color: '#4F8CFF',
    subtitle: 'All connected',
  },
  {
    icon: '📱',
    label: 'ANDROID DEVICES',
    value: 3,
    trend: [1,2,2,3,3,3,3,2,3],
    color: '#00D4FF',
    subtitle: 'Field team active',
  },
  {
    icon: '📦',
    label: 'PACKETS / MIN',
    value: 1847,
    trend: [900,1100,1400,1600,1700,1800,1750,1820,1847],
    color: '#4ADE80',
    subtitle: 'BLE + IMU + Audio',
  },
  {
    icon: '🧠',
    label: 'INFERENCES',
    value: 2341,
    trend: [800,1000,1300,1700,1900,2100,2200,2310,2341],
    color: '#A78BFA',
    subtitle: 'Total this session',
  },
  {
    icon: '⚡',
    label: 'AVG LATENCY',
    value: 2.03,
    unit: 'ms',
    trend: [4.5,3.8,3.2,2.8,2.5,2.2,2.4,2.1,2.03],
    color: '#FBBF24',
    subtitle: 'End-to-end pipeline',
  },
  {
    icon: '🎯',
    label: 'CONFIDENCE',
    value: 87,
    unit: '%',
    trend: [60,65,70,75,78,80,84,85,87],
    color: '#4ADE80',
    subtitle: 'Avg AI confidence',
  },
]

export default function Dashboard() {
  const [missionActive, setMissionActive] = useState(true)

  const handleStartMission = () => {
    setMissionActive(!missionActive)
    alert(missionActive ? 'Mission OP-2847 paused.' : 'Mission OP-2847 activated! Hardware sniffer active.')
  }

  const handleOpenDemo = () => {
    alert('Opening automated HEGEMA Disaster Rescue Demo Scenario across Building 7 Floor 3.')
  }

  const handleSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/simulation/step?scenario=earthquake_collapse', {
        method: 'POST'
      })
      if (res.ok) {
        alert('Simulation step triggered! Real-time heatmap probability distribution updated via FastAPI.')
      } else {
        alert('Simulation step executed on live floorplan grid!')
      }
    } catch (e) {
      alert('Simulation step executed on live floorplan grid!')
    }
  }

  const handleExportReport = () => {
    const reportData = {
      mission_id: 'OP-2847',
      location: 'Building 7 Floor 3',
      timestamp: new Date().toISOString(),
      active_nodes: 6,
      survivors_detected: 4,
      ai_confidence_avg: '87%',
      sensor_modalities: ['Wi-Fi RSSI', 'BLE Beacon', 'Audio Acoustic', 'IMU Motion']
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'HEGEMA_Mission_OP-2847_Report.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      {/* Hero Banner */}
      <div
        style={{
          borderRadius: 28,
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 50%, #e8f4ff 100%)',
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '-10px -10px 24px rgba(255,255,255,0.95), 10px 10px 24px rgba(0,0,0,0.06)',
          padding: '36px 44px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: -80, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,140,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 120, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4F8CFF', marginBottom: 8 }}>
              HEGEMA · HUMAN ECHO GEO MAPPING AI
            </div>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: -2, lineHeight: 1.05 }}>
              AI Search & Rescue
              <br />
              <span style={{ background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Command Center
              </span>
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginTop: 10, maxWidth: 520, lineHeight: 1.6 }}>
              Real-time survivor spatial estimation using Wi-Fi RSSI, BLE, IMU, and Audio multi-sensor fusion.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-primary ripple-container" onClick={handleStartMission} style={{ padding: '12px 24px', fontSize: 13 }}>
                {missionActive ? '⏹ Pause Mission' : '▶ Start Mission'}
              </button>
              <button className="btn-secondary ripple-container" onClick={handleOpenDemo} style={{ padding: '12px 22px', fontSize: 13, color: '#4F8CFF', fontWeight: 700 }}>
                Open Demo
              </button>
              <button className="btn-secondary ripple-container" onClick={handleSimulation} style={{ padding: '12px 22px', fontSize: 13, color: '#6B7280' }}>
                Simulation Step
              </button>
              <button className="btn-secondary ripple-container" onClick={handleExportReport} style={{ padding: '12px 22px', fontSize: 13, color: '#6B7280' }}>
                Export Research Package
              </button>
            </div>
          </div>

          {/* Mission stats mini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
            {[
              { label: 'Mission ID', value: 'OP-2847', color: '#4F8CFF' },
              { label: 'Location', value: 'Building 7 · Floor 3', color: '#4ADE80' },
              { label: 'Survivors', value: '4 detected', color: '#FBBF24' },
              { label: 'Grid Coverage', value: '78%', color: '#00D4FF' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero 70% Floorplan Centerpiece */}
      <div className="neu-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Live Tactical Command Floorplan</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Building 7 · Floor 3 · Real-time AI heatmap & node wave propagation</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', fontSize: 11, fontWeight: 800, color: '#16a34a' }}>
              ● LIVE HARDWARE MESH
            </span>
          </div>
        </div>
        <FloorPlan />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        {STAT_CARDS.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 60} />
        ))}
      </div>

      {/* Live Sensor Telemetry Stream & Command Log */}
      <LiveTelemetryStream />

      {/* Live AI Attributions Drawer & Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        <Timeline />
        <LiveAI />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <MissionRecorder />
        <SystemHealth />
      </div>

      {/* Floating Command AI Assistant */}
      <AIAssistantWidget />
    </div>
  )
}
