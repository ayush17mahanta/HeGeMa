'use client';

import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const FEATURES = [
  { feature: 'BLE RSSI', A: 88 },
  { feature: 'Audio', A: 72 },
  { feature: 'IMU', A: 65 },
  { feature: 'Wi-Fi', A: 91 },
  { feature: 'Thermal', A: 78 },
  { feature: 'Vibration', A: 55 },
]

const PIE_DATA = [
  { name: 'Survivor', value: 87, color: '#4ADE80' },
  { name: 'Debris', value: 8, color: '#FBBF24' },
  { name: 'Unknown', value: 5, color: '#9CA3AF' },
]

const ALERTS = [
  { id: 1, type: 'critical', msg: 'Strong BLE signal — Zone A4', time: '14:32:11', read: false },
  { id: 2, type: 'warning', msg: 'Audio anomaly detected — Room 302', time: '14:31:48', read: false },
  { id: 3, type: 'success', msg: 'Survivor confirmed — Room 301', time: '14:29:03', read: true },
  { id: 4, type: 'info', msg: 'ESP32 #4 reconnected', time: '14:27:55', read: true },
]

const ZONE_DATA = [
  { zone: 'Zone A', signals: 12, confidence: 91, status: 'hot' },
  { zone: 'Zone B', signals: 7, confidence: 74, status: 'warm' },
  { zone: 'Zone C', signals: 3, confidence: 45, status: 'cool' },
  { zone: 'Zone D', signals: 9, confidence: 83, status: 'hot' },
]

function alertColor(type: string) {
  if (type === 'critical') return '#FF6B6B'
  if (type === 'warning') return '#FBBF24'
  if (type === 'success') return '#4ADE80'
  return '#4F8CFF'
}

export default function LiveAI() {
  const [confidence, setConfidence] = useState(87)
  const [tab, setTab] = useState<'zones' | 'xai' | 'alerts'>('zones')
  const [alerts, setAlerts] = useState(ALERTS)

  useEffect(() => {
    const t = setInterval(() => {
      setConfidence(c => Math.max(60, Math.min(99, c + (Math.random() > 0.5 ? 1 : -1))))
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
      {/* AI Confidence */}
      <div
        className="neu-card"
        style={{ padding: '20px 22px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5 }}>AI CONFIDENCE</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: -1.5, fontVariantNumeric: 'tabular-nums' }}>
              {confidence}<span style={{ fontSize: 16, fontWeight: 500, color: '#9CA3AF' }}>%</span>
            </div>
          </div>
          <div style={{ width: 70, height: 70, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={22} outerRadius={32} dataKey="value" strokeWidth={0}>
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#4ADE80' }}>AI</span>
            </div>
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3 }}>
          <div
            style={{
              height: '100%', borderRadius: 3,
              width: `${confidence}%`,
              background: confidence > 80
                ? 'linear-gradient(90deg, #4ADE80, #00D4FF)'
                : confidence > 60
                  ? 'linear-gradient(90deg, #FBBF24, #4ADE80)'
                  : 'linear-gradient(90deg, #FF6B6B, #FBBF24)',
              transition: 'width 0.5s ease',
            }}
          />
        </div>

        {/* Model info */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['Random Forest', 'XGBoost', 'BLE Model'].map(m => (
            <div key={m}
              style={{
                padding: '3px 10px', borderRadius: 20,
                background: 'rgba(79,140,255,0.08)',
                border: '1px solid rgba(79,140,255,0.15)',
                fontSize: 10, fontWeight: 600, color: '#4F8CFF',
              }}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Tab panel */}
      <div className="neu-card" style={{ padding: '18px 22px', flex: 1 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 4 }}>
          {(['zones', 'xai', 'alerts'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 9, border: 'none',
                background: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#111827' : '#6B7280',
                fontWeight: tab === t ? 700 : 500,
                fontSize: 12, cursor: 'pointer',
                boxShadow: tab === t ? '-2px -2px 6px rgba(255,255,255,0.9), 2px 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'xai' ? 'XAI' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'alerts' && alerts.filter(a => !a.read).length > 0 && (
                <span style={{
                  marginLeft: 4, background: '#FF6B6B', color: 'white',
                  borderRadius: 8, padding: '1px 5px', fontSize: 9, fontWeight: 700,
                }}>
                  {alerts.filter(a => !a.read).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'zones' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ZONE_DATA.map(z => (
              <div key={z.zone}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 14,
                  background: 'rgba(246,248,251,0.8)',
                  border: '1px solid rgba(255,255,255,0.9)',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: z.status === 'hot' ? '#FF6B6B' : z.status === 'warm' ? '#FBBF24' : '#4F8CFF',
                  animation: 'breathe 2s infinite',
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', minWidth: 56 }}>{z.zone}</span>
                <span style={{ fontSize: 11, color: '#6B7280', flex: 1 }}>{z.signals} signals</span>
                <div style={{ width: 60, height: 5, background: 'rgba(0,0,0,0.06)', borderRadius: 2.5 }}>
                  <div style={{
                    width: `${z.confidence}%`, height: '100%', borderRadius: 2.5,
                    background: `linear-gradient(90deg, #4F8CFF, #00D4FF)`,
                  }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4F8CFF', minWidth: 36, textAlign: 'right' }}>
                  {z.confidence}%
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'xai' && (
          <div style={{ height: 180 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: 0.5 }}>
              FEATURE IMPORTANCE
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={FEATURES}>
                <PolarGrid stroke="rgba(79,140,255,0.12)" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 9, fill: '#9CA3AF' }} />
                <Radar name="Importance" dataKey="A" stroke="#4F8CFF" fill="#4F8CFF" fillOpacity={0.18} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {alerts.map(a => (
              <div key={a.id}
                onClick={() => setAlerts(prev => prev.map(x => x.id === a.id ? { ...x, read: true } : x))}
                style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: a.read ? 'rgba(246,248,251,0.6)' : 'rgba(255,255,255,0.9)',
                  border: `1px solid ${a.read ? 'rgba(255,255,255,0.7)' : alertColor(a.type) + '33'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                  opacity: a.read ? 0.65 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: alertColor(a.type), flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#111827', flex: 1 }}>{a.msg}</span>
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2, paddingLeft: 14 }}>{a.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
