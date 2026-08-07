'use client';

import { useState } from 'react'

type SettingsTab = 'mission' | 'ai' | 'hardware' | 'dataset' | 'appearance' | 'notifications' | 'security' | 'cloud'

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

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{value}%</span>
      </div>
      <div style={{ position: 'relative', height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 3, background: 'rgba(0,0,0,0.08)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${value}%`, borderRadius: 3, background: 'linear-gradient(90deg, #4F8CFF, #00D4FF)' }} />
        <input
          type="range" min={0} max={100} value={value}
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
  const [activeTab, setActiveTab] = useState<SettingsTab>('mission')
  const [settings, setSettings] = useState({
    autoRecord: true,
    liveHeatmap: true,
    soundAlerts: false,
    darkMode: false,
    autoSave: true,
    multifloor: false,
    cloudSync: true,
    emailReports: false,
    confidenceThreshold: 75,
    scanInterval: 60,
    alertVolume: 80,
  })

  const toggle = (k: keyof typeof settings) =>
    setSettings(s => ({ ...s, [k]: !s[k] }))

  const slide = (k: keyof typeof settings, v: number) =>
    setSettings(s => ({ ...s, [k]: v }))

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'mission', label: 'Mission' },
    { id: 'ai', label: 'AI & Models' },
    { id: 'hardware', label: 'Hardware' },
    { id: 'dataset', label: 'Dataset' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
    { id: 'cloud', label: 'Cloud Sync' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 4 }}>Command Center Settings</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Configure HEGEMA emergency operations preferences</div>
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
              boxShadow: activeTab === t.id ? '-2px -2px 6px rgba(255,255,255,0.9), 2px 2px 6px rgba(0,0,0,0.06)' : 'none',
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
            <SettingRow label="Auto-start recording" sub="Begin recording telemetry as soon as mission is active">
              <Toggle on={settings.autoRecord} onChange={() => toggle('autoRecord')} />
            </SettingRow>
            <SettingRow label="Auto-save sessions" sub="Save telemetry snapshot logs every 5 minutes">
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

        {activeTab === 'ai' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>AI Inference Engine Settings</div>
            <SettingRow label="Ensemble Sensor Fusion" sub="Combine Wi-Fi, BLE, Audio, and IMU estimators">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow label="Explainable AI (XAI) Attribution" sub="Compute feature importance attributions in real time">
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
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Appearance & Theme</div>
            <SettingRow label="Live Heatmap Visual Overlay" sub="Render real-time spatial probability gradient on floorplan">
              <Toggle on={settings.liveHeatmap} onChange={() => toggle('liveHeatmap')} />
            </SettingRow>
            <SettingRow label="Dark Tactical Theme" sub="Switch UI to Command Center Dark mode">
              <Toggle on={settings.darkMode} onChange={() => toggle('darkMode')} />
            </SettingRow>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Sound & Alert Preferences</div>
            <SettingRow label="Acoustic Sound Alerts" sub="Play audio chime on high-confidence survivor detection">
              <Toggle on={settings.soundAlerts} onChange={() => toggle('soundAlerts')} />
            </SettingRow>
            {settings.soundAlerts && (
              <div style={{ paddingTop: 16 }}>
                <Slider value={settings.alertVolume} onChange={v => slide('alertVolume', v)} label="Chime Volume Level" />
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Security & Zero-Trust Local Edge</div>
            <SettingRow label="Local TLS Telemetry Encryption" sub="Encrypt node-to-hub MQTT messages over TLS">
              <Toggle on={true} onChange={() => {}} />
            </SettingRow>
          </div>
        )}

        {activeTab === 'cloud' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Cloud Backup & Sync</div>
            <SettingRow label="HEGEMA Cloud Sync" sub="Backup mission recordings automatically when internet is available">
              <Toggle on={settings.cloudSync} onChange={() => toggle('cloudSync')} />
            </SettingRow>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" onClick={() => alert('Settings saved successfully!')} style={{ padding: '13px 32px', fontSize: 14 }}>
          Save Preferences
        </button>
        <button className="btn-secondary" style={{ padding: '13px 24px', fontSize: 14, color: '#6B7280' }}>
          Reset Defaults
        </button>
      </div>
    </div>
  )
}
