import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

const MODELS = [
  { name: 'Random Forest', accuracy: 94.2, latency: 23, status: 'active', sensors: 'BLE+IMU+Audio', color: '#4ADE80' },
  { name: 'XGBoost', accuracy: 91.8, latency: 18, status: 'active', sensors: 'BLE+CO2', color: '#4F8CFF' },
  { name: 'BLE Classifier', accuracy: 88.4, latency: 8, status: 'training', sensors: 'BLE only', color: '#FBBF24' },
  { name: 'Audio CNN', accuracy: 86.1, latency: 45, status: 'idle', sensors: 'Audio only', color: '#A78BFA' },
]

const RECORDS = [
  { id: 'REC-001', date: '2026-08-07 14:32', duration: '00:42:18', packets: 12847, survivors: 4, zone: 'B7-F3', size: '18.4 MB' },
  { id: 'REC-002', date: '2026-08-07 11:15', duration: '01:12:44', packets: 28431, survivors: 2, zone: 'B3-F1', size: '41.2 MB' },
  { id: 'REC-003', date: '2026-08-06 16:48', duration: '00:28:09', packets: 8234, survivors: 1, zone: 'B7-F2', size: '11.9 MB' },
  { id: 'REC-004', date: '2026-08-06 09:22', duration: '02:01:53', packets: 51204, survivors: 6, zone: 'B12-F4', size: '74.3 MB' },
]

const ACCURACY_DATA = [
  { epoch: 1, acc: 62 }, { epoch: 5, acc: 74 }, { epoch: 10, acc: 81 },
  { epoch: 15, acc: 86 }, { epoch: 20, acc: 89 }, { epoch: 25, acc: 91 },
  { epoch: 30, acc: 92.8 }, { epoch: 35, acc: 93.5 }, { epoch: 40, acc: 94.2 },
]

const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: 12,
  fontSize: 12,
}

export default function Dataset() {
  const [search, setSearch] = useState('')
  const [selectedModel, setSelectedModel] = useState(0)

  const filtered = RECORDS.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.zone.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 4, letterSpacing: -0.5 }}>AI Models</div>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Inference pipeline · multi-sensor fusion</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {MODELS.map((m, i) => (
            <div
              key={m.name}
              className="neu-card card-hover"
              onClick={() => setSelectedModel(i)}
              style={{
                padding: '18px 20px', cursor: 'pointer',
                border: selectedModel === i ? `1.5px solid ${m.color}` : '1px solid rgba(255,255,255,0.8)',
                outline: selectedModel === i ? `4px solid ${m.color}18` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: m.color,
                  animation: m.status === 'active' ? 'breathe 2s infinite' : m.status === 'training' ? 'breathe 0.8s infinite' : 'none',
                }} />
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                  color: m.status === 'active' ? '#4ADE80' : m.status === 'training' ? '#FBBF24' : '#9CA3AF',
                }}>
                  {m.status}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 14 }}>{m.sensors}</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: m.color, letterSpacing: -0.5 }}>{m.accuracy}%</div>
                  <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>ACCURACY</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827', letterSpacing: -0.5 }}>{m.latency}<span style={{ fontSize: 11, fontWeight: 500, color: '#9CA3AF' }}>ms</span></div>
                  <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600 }}>LATENCY</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="neu-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Training Progress</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>
            {MODELS[selectedModel].name} · Epoch accuracy
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ACCURACY_DATA}>
                <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="acc" fill={MODELS[selectedModel].color} radius={[4, 4, 0, 0]} name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neu-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Confusion Matrix</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 20 }}>Predicted vs actual</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'True Pos.', value: '94%', bg: '#4ADE8022', border: '#4ADE8044', color: '#16a34a' },
              { label: 'False Pos.', value: '6%', bg: '#FF6B6B18', border: '#FF6B6B33', color: '#FF6B6B' },
              { label: 'False Neg.', value: '3%', bg: '#FBBF2418', border: '#FBBF2433', color: '#d97706' },
              { label: 'True Neg.', value: '97%', bg: '#4F8CFF18', border: '#4F8CFF33', color: '#4F8CFF' },
            ].map(c => (
              <div key={c.label}
                style={{
                  padding: '14px', borderRadius: 14,
                  background: c.bg, border: `1px solid ${c.border}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, color: c.color, letterSpacing: -1 }}>{c.value}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', marginTop: 2 }}>{c.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="neu-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Mission Recordings</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>{RECORDS.length} datasets available</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recordings…"
              style={{
                padding: '8px 14px 8px 14px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.9)',
                background: 'rgba(246,248,251,0.9)',
                boxShadow: 'inset -3px -3px 8px rgba(255,255,255,0.9), inset 3px 3px 8px rgba(0,0,0,0.04)',
                fontSize: 13,
                color: '#111827',
                outline: 'none',
                width: 200,
              }}
            />
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              + New Recording
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['ID', 'Date', 'Duration', 'Packets', 'Survivors', 'Zone', 'Size', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                style={{ animation: `fade-in 0.3s ease ${i * 50}ms both` }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,140,255,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#4F8CFF' }}>{r.id}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>{r.date}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{r.duration}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{r.packets.toLocaleString()}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', fontSize: 11, fontWeight: 700, color: '#16a34a' }}>
                    {r.survivors}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#111827' }}>{r.zone}</td>
                <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280' }}>{r.size}</td>
                <td style={{ padding: '12px 14px' }}>
                  <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 11, color: '#4F8CFF', fontWeight: 700 }}>
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
