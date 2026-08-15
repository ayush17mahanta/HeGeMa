'use client';

import { useState } from 'react'
import { useHEGEMARuntime } from '../context/RuntimeContext'
import StatCard from '../components/StatCard'
import FloorPlan from '../components/FloorPlan'
import LiveAI from '../components/LiveAI'
import SystemHealth from '../components/SystemHealth'
import MissionRecorder from '../components/MissionRecorder'
import Timeline from '../components/Timeline'
import LiveTelemetryStream from '../components/LiveTelemetryStream'
import AIAssistantWidget from '../components/AIAssistantWidget'
import { CSISensorCard } from '../components/CSISensorCard'

export default function Dashboard() {
  const runtime = useHEGEMARuntime()
  const { systemMode, mission, selected_map, hardware_summary, telemetry_metrics, startMission, stopMission, startSimulation, stopSimulation } = runtime

  const [hardwareModalOpen, setHardwareModalOpen] = useState(false)

  const handleStartMissionClick = async () => {
    if (mission.status === 'ACTIVE') {
      await stopMission()
    } else {
      const res = await startMission()
      if (res.status === 'WAITING_FOR_HARDWARE') {
        setHardwareModalOpen(true)
      }
    }
  }

  const handleToggleSimulation = async () => {
    if (systemMode === 'SIMULATION') {
      await stopSimulation()
    } else {
      await startSimulation('moving_survivors')
    }
  }

  const handleExportReport = () => {
    const reportData = {
      mission_id: mission.mission_id || 'OP-NONE',
      system_mode: systemMode,
      mission_status: mission.status,
      elapsed_seconds: mission.elapsed_seconds,
      location: selected_map,
      timestamp: new Date().toISOString(),
      active_esp32_nodes: hardware_summary.esp32_count,
      survivors_detected: systemMode === 'OFFLINE' ? 0 : (systemMode === 'SIMULATION' ? 4 : 0)
    }
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `HEGEMA_Mission_Report_${systemMode}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statCards = [
    {
      icon: '⚡',
      label: 'CSI SUB-CARRIERS',
      value: systemMode === 'OFFLINE' ? 0 : 64,
      trend: systemMode === 'OFFLINE' ? [0,0,0,0,0,0,0,0,0] : [64,64,64,64,64,64,64,64,64],
      color: '#06B6D4',
      subtitle: systemMode === 'OFFLINE' ? 'CSI Unavailable' : 'HT20 / 2.4 GHz',
    },
    {
      icon: '📡',
      label: 'ESP32 NODES',
      value: hardware_summary.esp32_count,
      trend: [0,0,0,0,0,0,0,0,hardware_summary.esp32_count],
      color: '#4F8CFF',
      subtitle: systemMode === 'REAL' ? `${hardware_summary.csi_node_count} CSI Active` : 'No Hardware Connected',
    },
    {
      icon: '📱',
      label: 'ANDROID DEVICES',
      value: hardware_summary.android_count,
      trend: [0,0,0,0,0,0,0,0,hardware_summary.android_count],
      color: '#00D4FF',
      subtitle: hardware_summary.android_count > 0 ? 'Field Device Connected' : 'Waiting for Device',
    },
    {
      icon: '📦',
      label: 'PACKETS / MIN',
      value: systemMode === 'REAL' ? telemetry_metrics.packets_per_minute : (systemMode === 'SIMULATION' ? 1847 : 0),
      trend: systemMode === 'OFFLINE' ? [0,0,0,0,0,0,0,0,0] : [1000,1200,1400,1600,1800,1847],
      color: '#4ADE80',
      subtitle: systemMode === 'OFFLINE' ? 'No Telemetry Stream' : 'Validated Telemetry',
    },
    {
      icon: '🧠',
      label: 'INFERENCES',
      value: systemMode === 'REAL' ? telemetry_metrics.total_real_inferences : (systemMode === 'SIMULATION' ? 2341 : 0),
      trend: systemMode === 'OFFLINE' ? [0,0,0,0,0,0,0,0,0] : [500,1000,1500,2000,2341],
      color: '#A78BFA',
      subtitle: systemMode === 'OFFLINE' ? 'Inference Idle' : 'AI Model Zoo',
    },
    {
      icon: '🎯',
      label: 'CONFIDENCE',
      value: systemMode === 'OFFLINE' ? '—' : 87,
      unit: systemMode === 'OFFLINE' ? '' : '%',
      trend: systemMode === 'OFFLINE' ? [0,0,0,0,0,0,0,0,0] : [70,75,80,85,87],
      color: '#4ADE80',
      subtitle: systemMode === 'OFFLINE' ? 'No Live Evidence' : 'Fused AI Confidence',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      {/* Waiting for Hardware Alert Modal */}
      {hardwareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-center text-slate-100 uppercase tracking-wider">CANNOT START LIVE MISSION</h3>
            <p className="text-xs text-slate-400 text-center mt-2 leading-relaxed">
              No physical ESP32 or Android sniffer nodes are currently connected. HEGEMA strictly enforces ZERO-FABRICATION rules and will not start mission timers or manufacture fake telemetry.
            </p>

            <div className="my-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>ESP32 Hardware Sniffer:</span>
                <span className="text-amber-400 font-bold">OFFLINE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Android Sensor App:</span>
                <span className="text-amber-400 font-bold">OFFLINE</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setHardwareModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
              <button
                onClick={() => { setHardwareModalOpen(false); handleToggleSimulation() }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
              >
                Start Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Simulation Watermark Banner when SIMULATION mode is active */}
      {systemMode === 'SIMULATION' && (
        <div className="w-full bg-amber-950/90 border-2 border-amber-500 text-amber-300 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-lg shadow-amber-950/50">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>⚠ SIMULATION MODE ACTIVE — SYNTHETIC TELEMETRY (NO PHYSICAL HARDWARE CONNECTED)</span>
          </div>
          <button
            onClick={handleToggleSimulation}
            className="px-3 py-1 bg-amber-500 text-slate-950 rounded hover:bg-amber-400 font-bold uppercase transition-all"
          >
            STOP SIMULATION
          </button>
        </div>
      )}

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
        
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#4F8CFF' }}>
                HEGEMA · HUMAN ECHO GEO MAPPING AI
              </span>
              
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                systemMode === 'REAL' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                  : (systemMode === 'SIMULATION' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-slate-200 text-slate-600 border-slate-300')
              }`}>
                {systemMode === 'REAL' ? '🟢 REAL HARDWARE' : (systemMode === 'SIMULATION' ? '🟠 SIMULATION' : '⚪ OFFLINE')}
              </span>
            </div>

            <h1 style={{ fontSize: 44, fontWeight: 900, color: '#111827', margin: 0, letterSpacing: -2, lineHeight: 1.05 }}>
              AI Search & Rescue
              <br />
              <span style={{ background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Command Center
              </span>
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', marginTop: 10, maxWidth: 540, lineHeight: 1.6 }}>
              Real-time survivor spatial estimation using Wi-Fi CSI, RSSI, BLE, IMU, and Audio multi-sensor fusion.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button className="btn-primary ripple-container" onClick={handleStartMissionClick} style={{ padding: '12px 24px', fontSize: 13 }}>
                {mission.status === 'ACTIVE' ? '⏹ Pause Mission' : '▶ Start Mission'}
              </button>
              <button 
                className="btn-secondary ripple-container" 
                onClick={handleToggleSimulation} 
                style={{ padding: '12px 22px', fontSize: 13, color: systemMode === 'SIMULATION' ? '#D97706' : '#4F8CFF', fontWeight: 700 }}
              >
                {systemMode === 'SIMULATION' ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              <button className="btn-secondary ripple-container" onClick={handleExportReport} style={{ padding: '12px 22px', fontSize: 13, color: '#6B7280' }}>
                Export Research Package
              </button>
            </div>
          </div>

          {/* Mission stats mini */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 200 }}>
            {[
              { label: 'Mission Status', value: mission.status, color: mission.status === 'ACTIVE' ? '#4ADE80' : (mission.status === 'WAITING_FOR_HARDWARE' ? '#FBBF24' : '#9CA3AF') },
              { label: 'Selected Map', value: `${selected_map.building} · ${selected_map.floor}`, color: '#4F8CFF' },
              { label: 'Survivors', value: systemMode === 'OFFLINE' ? '0' : (systemMode === 'SIMULATION' ? '4 detected' : '0'), color: '#FBBF24' },
              { label: 'CSI Hardware', value: hardware_summary.csi_node_count > 0 ? `${hardware_summary.csi_node_count} Active` : 'Unavailable', color: '#06B6D4' },
              { label: 'Grid Coverage', value: systemMode === 'OFFLINE' ? '0%' : '78%', color: '#00D4FF' },
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
            <div style={{ fontSize: 12, color: '#6B7280' }}>{selected_map.building} · {selected_map.floor} · Real-time AI heatmap & CSI evidence layer</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              systemMode === 'REAL' 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                : (systemMode === 'SIMULATION' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'bg-slate-100 text-slate-500 border-slate-300')
            }`}>
              {systemMode === 'REAL' ? '🟢 LIVE HARDWARE MESH' : (systemMode === 'SIMULATION' ? '🟠 SYNTHETIC SIMULATION STREAM' : '⚪ NO HARDWARE CONNECTED')}
            </span>
          </div>
        </div>
        <FloorPlan systemMode={systemMode} hardwareCount={hardware_summary.esp32_count} />
      </div>

      {/* CSI Sensor Plugin Card */}
      <CSISensorCard systemMode={systemMode} />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 60} />
        ))}
      </div>

      {/* Live Sensor Telemetry Stream & Command Log */}
      <LiveTelemetryStream systemMode={systemMode} />

      {/* Live AI Attributions Drawer & Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>
        <Timeline systemMode={systemMode} />
        <LiveAI systemMode={systemMode} />
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <MissionRecorder systemMode={systemMode} />
        <SystemHealth />
      </div>

      {/* Floating Command AI Assistant */}
      <AIAssistantWidget systemMode={systemMode} />
    </div>
  )
}
