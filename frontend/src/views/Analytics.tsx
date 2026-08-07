import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, LineChart, Line
} from 'recharts'

const AREA_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, '0')}:00`,
  packets: Math.floor(800 + Math.sin(i * 0.5) * 400 + Math.random() * 200),
  inferences: Math.floor(600 + Math.cos(i * 0.4) * 300 + Math.random() * 150),
  confidence: Math.floor(70 + Math.sin(i * 0.3) * 15 + Math.random() * 8),
}))

const BAR_DATA = [
  { zone: 'Zone A', signals: 42, confirmed: 31 },
  { zone: 'Zone B', signals: 28, confirmed: 19 },
  { zone: 'Zone C', signals: 16, confirmed: 9 },
  { zone: 'Zone D', signals: 35, confirmed: 26 },
  { zone: 'Zone E', signals: 21, confirmed: 14 },
]

const RADAR_DATA = [
  { subject: 'BLE', A: 88, B: 72 },
  { subject: 'Audio', A: 75, B: 65 },
  { subject: 'IMU', A: 65, B: 80 },
  { subject: 'CO2', A: 90, B: 55 },
  { subject: 'Thermal', A: 78, B: 68 },
  { subject: 'Vibration', A: 55, B: 82 },
]

const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: 12,
  boxShadow: '-4px -4px 12px rgba(255,255,255,0.9), 4px 4px 12px rgba(0,0,0,0.08)',
  fontSize: 12,
  fontFamily: 'Inter',
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="neu-card" style={{ padding: '22px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{subtitle}</div>
      </div>
      {children}
    </div>
  )
}

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Signals', value: '142', delta: '+18%', color: '#4F8CFF' },
          { label: 'Confirmed Survivors', value: '4', delta: '+2 today', color: '#4ADE80' },
          { label: 'Avg Confidence', value: '87%', delta: '+4.2%', color: '#00D4FF' },
          { label: 'Mission Duration', value: '1h 24m', delta: 'Active', color: '#FBBF24' },
        ].map(k => (
          <div key={k.label} className="neu-card card-hover" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', letterSpacing: 0.5, marginBottom: 8 }}>
              {k.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#111827', letterSpacing: -1.5 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: k.color, fontWeight: 600, marginTop: 4 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <ChartCard title="Signal & Inference Volume" subtitle="24-hour rolling window">
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={AREA_DATA}>
              <defs>
                <linearGradient id="gPkt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8CFF" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#4F8CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="packets" stroke="#4F8CFF" strokeWidth={2} fill="url(#gPkt)" name="Packets" />
              <Area type="monotone" dataKey="inferences" stroke="#00D4FF" strokeWidth={2} fill="url(#gInf)" name="Inferences" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <ChartCard title="Signals by Zone" subtitle="Detected vs confirmed">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis dataKey="zone" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="signals" fill="#4F8CFF" radius={[6, 6, 0, 0]} name="Detected" />
                <Bar dataKey="confirmed" fill="#4ADE80" radius={[6, 6, 0, 0]} name="Confirmed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Sensor Contribution" subtitle="Current vs baseline model">
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="rgba(79,140,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Radar name="Current" dataKey="A" stroke="#4F8CFF" fill="#4F8CFF" fillOpacity={0.18} strokeWidth={2} />
                <Radar name="Baseline" dataKey="B" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.10} strokeWidth={2} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="AI Confidence Trend" subtitle="Rolling confidence score per inference cycle">
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={AREA_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="confidence" stroke="#4ADE80" strokeWidth={2.5} dot={false} name="Confidence %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}
