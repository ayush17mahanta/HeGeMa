'use client';

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  unit?: string
  trend: number[]
  color: string
  subtitle: string
  delay?: number
}

export default function StatCard({ icon, label, value, unit, trend, color, subtitle, delay = 0 }: StatCardProps) {
  const min = Math.min(...trend)
  const max = Math.max(...trend)
  const range = max - min || 1
  const points = trend.map((val, idx) => {
    const x = (idx / (trend.length - 1)) * 120
    const y = 36 - ((val - min) / range) * 28
    return `${x},${y}`
  }).join(' ')

  return (
    <div
      className="neu-card card-hover"
      style={{
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        animation: `fade-in 0.4s cubic-bezier(0.34,1.2,0.64,1) both ${delay}ms`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 140,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: `0 4px 12px ${color}20`,
          }}
        >
          {icon}
        </div>
        <svg width={80} height={36} style={{ overflow: 'visible' }}>
          <path
            d={`M ${points}`}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sparkline-path"
          />
        </svg>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1.2, marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#111827', letterSpacing: '-1px', fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </span>
          {unit && (
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>
              {unit}
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, fontWeight: 500 }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}
