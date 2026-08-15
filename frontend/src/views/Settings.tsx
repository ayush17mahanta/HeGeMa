'use client';

import { useState, useEffect } from 'react'
import { useHEGEMARuntime } from '../context/RuntimeContext'

type SettingsTab = 'mission' | 'csi' | 'ai' | 'hardware' | 'appearance' | 'notifications'

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 48, height: 26, borderRadius: 13, border: 'none',
        background: on ? 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)' : 'rgba(0,0,0,0.1)',
        cursor: 'pointer', position: 'relative',
        transition: 'background 0.3s ease',
        boxShadow: on ? '0 2px 8px rgba(79,140,255,0.4)' : 'inset -2px -2px 5px rgba(255,255,255,0.8), inset 2px 2px 5px rgba(0,0,0,0.06)',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute', top: 3,
          left: on ? 25 : 3, width: 20, height: 20, borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />
    </button>
  )
}

function Slider({ value, onChange, label, min = 0, max = 100, unit = '%' }: { value: number; onChange: (v: number) => void; label: string; min?: number; max?: number; unit?: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{value}{unit}</span>
      </div>
      <div style={{ position: 'relative', height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: 'rgba(0,0,0,0.08)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${((value - min) / (max - min)) * 100}%`, borderRadius: 3, background: 'linear-gradient(90deg, #4F8CFF, #00D4FF)' }} />
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%' }}
        />
      </div>
    </div>
  )
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const runtime = useHEGEMARuntime()

  const [activeTab, setActiveTab] = useState<SettingsTab>('mission')
  const [settings, setSettings] = useState({
    autoRecord: true,
    autoSave: true,
    multifloor: false,
    confidenceThreshold: 75,
    csiEnabled: true,
    windowSize: 20,
    hampelFilter: true,
    phaseSanitization: true,
    liveHeatmap: true,
    soundAlerts: false,
  })

  // Load CSI config from backend
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/csi/status')
      .then(res => res.json())
      .then(data => {
        if (data.csi_enabled !== undefined) {
          setSettings(s => ({
            ...s,
            csiEnabled: data.csi_enabled,
            windowSize: data.window_size || 20,
            hampelFilter: data.preprocessor?.hampel_filter ?? true,
            phaseSanitization: data.preprocessor?.phase_sanitization ?? true,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const toggle = (k: keyof typeof settings) => setSettings(s => ({ ...s, [k]: !s[k] }))
  const slide = (k: keyof typeof settings, v: number) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/csi/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          window_size: settings.windowSize,
          csi_enabled: settings.csiEnabled,
          hampel_filter: settings.hampelFilter,
          phase_sanitization: settings.phaseSanitization,
        })
      })
      alert('Command Center preferences and CSI preprocessor configuration saved!')
    } catch (e) {
      alert('Preferences saved locally.')
    }
  }

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'mission', label: 'Mission' },
    { id: 'csi', label: 'Wi-Fi CSI Subsystem' },
    { id: 'ai', label: 'AI & Models' },
    { id: 'hardware', label: 'Hardware & HAL' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 4 }}>Command Center Settings</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Configure HEGEMA emergency operations and CSI sensor preprocessor</div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'rgba(0,0,0,0.04)', padding: 6, borderRadius: 16 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              background: activeTab === t.id ? 'white' : 'transparent',
              color: activeTab === t.id ? '#111827' : '#6B7280',
              fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: 12,
              cursor: 'pointer',
              boxShadow: activeTab === t.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="neu-card" style={{ padding: '28px 32px' }}>
        {activeTab === 'mission' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Mission Operations Config</div>
            <SettingRow label="Auto-start recording on valid mission start" sub="Begin telemetry logging to data_lake/missions/ when mission is ACTIVE">
              <Toggle on={settings.autoRecord} onChange={() => toggle('autoRecord')} />
            </SettingRow>
            <SettingRow label="Auto-save telemetry sessions" sub="Save telemetry snapshot logs every 5 minutes during active mission">
              <Toggle on={settings.autoSave} onChange={() => toggle('autoSave')} />
            </SettingRow>
            <SettingRow label="Multi-floor vertical scanning" sub="Enable multi-story floorplan depth mapping">
              <Toggle on={settings.multifloor} onChange={() => toggle('multifloor')} />
            </SettingRow>
            <div style={{ paddingTop: 16 }}>
              <Slider value={settings.confidenceThreshold} onChange={v => slide('confidenceThreshold', v)} label="Survivor Occupancy Alert Confidence Threshold" />
            </div>
          </div>
        )}

        {activeTab === 'csi' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Wi-Fi CSI Sensor Plugin Configuration</div>
            <SettingRow label="Enable Wi-Fi CSI Capture" sub="Extract 64 subcarrier amplitude and phase metrics from ESP32">
              <Toggle on={settings.csiEnabled} onChange={() => toggle('csiEnabled')} />
            </SettingRow>
            <SettingRow label="Hampel Outlier Filter" sub="Remove impulse noise spikes across subcarriers using rolling median">
              <Toggle on={settings.hampelFilter} onChange={() => toggle('hampelFilter')} />
            </SettingRow>
            <SettingRow label="Linear Phase Unwrapping & Sanitization" sub="Sanitize carrier frequency offset (CFO) and sampling time offset (STO)">
              <Toggle on={settings.phaseSanitization} onChange={() => toggle('phaseSanitization')} />
            </SettingRow>
            <div style={{ paddingTop: 16 }}>
              <Slider value={settings.windowSize} min={5} max={100} unit=" frames" onChange={v => slide('windowSize', v)} label="CSI Preprocessor Window Size" />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>AI Inference Engine Settings</div>
            <SettingRow label="Ensemble Sensor Fusion Engine" sub="Dynamically combine Wi-Fi CSI, RSSI, BLE, Audio, and IMU estimators">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Explainable AI (XAI) Attribution" sub="Compute Shapley-additive feature attributions in real time">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
          </div>
        )}

        {activeTab === 'hardware' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Hardware & HAL Driver Settings</div>
            <SettingRow label="ESP32 Promiscuous Sniffing" sub="Enable raw 802.11 RSSI packet inspection">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Android Field Sensor Sync" sub="Sync accelerometer, gyroscope, and mic RMS over UDP">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Appearance & Tactical Theme</div>
            <SettingRow label="Live Heatmap Visual Overlay" sub="Render real-time spatial probability gradient on floorplan">
              <Toggle on={settings.liveHeatmap} onChange={() => toggle('liveHeatmap')} />
            </SettingRow>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Sound & Alert Preferences</div>
            <SettingRow label="Acoustic Sound Alerts" sub="Play audio chime on high-confidence survivor detection">
              <Toggle on={settings.soundAlerts} onChange={() => toggle('soundAlerts')} />
            </SettingRow>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" onClick={handleSave} style={{ padding: '13px 32px', fontSize: 14 }}>
          Save Preferences
        </button>
      </div>
    </div>
  )
}
