'use client';

import { useState } from 'react'
import { useHEGEMARuntime } from '../context/RuntimeContext'

interface NavbarProps {
  darkMode: boolean
  onToggleDark: () => void
}

export default function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState(0)
  const [showNotifs, setShowNotifs] = useState(false)

  const runtime = useHEGEMARuntime()
  const { systemMode, mission, location, services } = runtime

  const fmtTimer = (s: number) => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, '0')
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const secs = String(s % 60).padStart(2, '0')
    return `${hrs}:${mins}:${secs}`
  }

  return (
    <header
      style={{
        height: 64,
        position: 'fixed',
        top: 0,
        right: 0,
        left: 240,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '0 4px 20px rgba(79,140,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 40,
      }}
    >
      {/* Left: Search & Provenance Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 220 }}>
          <input
            type="text"
            placeholder="Search zones, devices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 16px 8px 34px',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.9)',
              background: '#F6F8FB',
              boxShadow: 'inset -3px -3px 8px rgba(255,255,255,0.9), inset 3px 3px 8px rgba(0,0,0,0.06)',
              fontSize: 12,
              color: '#111827',
              outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9CA3AF' }}>
            🔍
          </span>
        </div>

        {/* GPS Location (NO FALLBACK DEFAULTS) */}
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: location ? '#4F8CFF' : '#94A3B8' }}>📍</span>
          <span>{location ? location.label : 'LOCATION NOT AVAILABLE'}</span>
        </div>
      </div>

      {/* Center: Mission Clock (GATED BY ACTIVE MISSION STATUS) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px',
          borderRadius: 20,
          background: mission.status === 'ACTIVE'
            ? 'linear-gradient(135deg, rgba(79,140,255,0.1) 0%, rgba(0,212,255,0.08) 100%)'
            : '#F1F5F9',
          border: mission.status === 'ACTIVE' ? '1px solid rgba(79,140,255,0.2)' : '1px solid #E2E8F0',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: mission.status === 'ACTIVE' ? '#6B7280' : '#94A3B8' }}>
          MISSION TIMER:
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: mission.status === 'ACTIVE' ? '#4F8CFF' : '#64748B', fontVariantNumeric: 'tabular-nums' }}>
          {fmtTimer(mission.elapsed_seconds)}
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Backend & Edge Service Health */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
          <span style={{ color: '#4ADE80' }}>🟢</span>
          <span>LOCAL BACKEND {services.local_backend}</span>
        </div>

        {/* System Mode Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: systemMode === 'REAL'
              ? 'rgba(74,222,128,0.12)'
              : (systemMode === 'SIMULATION' ? 'rgba(245,158,11,0.12)' : '#F1F5F9'),
            border: systemMode === 'REAL'
              ? '1px solid rgba(74,222,128,0.3)'
              : (systemMode === 'SIMULATION' ? '1px solid rgba(245,158,11,0.3)' : '1px solid #E2E8F0'),
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: systemMode === 'REAL' ? '#4ADE80' : (systemMode === 'SIMULATION' ? '#F59E0B' : '#94A3B8'),
              boxShadow: systemMode === 'REAL' ? '0 0 8px #4ADE80' : 'none',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: systemMode === 'REAL' ? '#166534' : (systemMode === 'SIMULATION' ? '#B45309' : '#64748B') }}>
            {systemMode === 'REAL' ? 'REAL HARDWARE' : (systemMode === 'SIMULATION' ? 'SIMULATION' : 'OFFLINE')}
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setNotifications(0) }}
            className="btn-secondary"
            style={{
              width: 38,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              position: 'relative',
            }}
          >
            🔔
            {notifications > 0 && (
              <span
                style={{
                  position: 'absolute', top: 3, right: 3, width: 15, height: 15,
                  borderRadius: '50%', background: '#FF6B6B', color: 'white',
                  fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {notifications}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              style={{
                position: 'absolute', right: 0, top: 48, width: 280,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.1)', padding: 16, zIndex: 100,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 8 }}>System Audit Log</div>
              <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>No active notifications.</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 5px',
            borderRadius: 18, background: 'var(--card)', border: 'var(--glass-border)',
          }}
        >
          <div
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white',
            }}
          >
            IC
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Cmdr. Vance</div>
            <div style={{ fontSize: 9, color: '#6B7280' }}>Lead Rescue Tech</div>
          </div>
        </div>
      </div>
    </header>
  )
}
