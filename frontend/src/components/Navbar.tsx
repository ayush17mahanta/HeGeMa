'use client';

import { useState, useEffect } from 'react'

interface NavbarProps {
  darkMode: boolean
  onToggleDark: () => void
}

export default function Navbar({ darkMode, onToggleDark }: NavbarProps) {
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState(3)
  const [showNotifs, setShowNotifs] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(5078) // 01:24:38

  useEffect(() => {
    const t = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

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
      {/* Left: Search & GPS Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 240 }}>
          <input
            type="text"
            placeholder="Search zones, devices, events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 16px 8px 36px',
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

        {/* GPS Coordinates */}
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#4F8CFF' }}>📍</span>
          <span>28.6139° N, 77.2090° E</span>
        </div>
      </div>

      {/* Center: Mission Clock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(79,140,255,0.1) 0%, rgba(0,212,255,0.08) 100%)',
          border: '1px solid rgba(79,140,255,0.2)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280' }}>MISSION TIMER:</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#4F8CFF', fontVariantNumeric: 'tabular-nums' }}>
          {fmtTimer(timerSeconds)}
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Network & Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
          <span style={{ color: '#4ADE80' }}>⚡ 98%</span>
          <span style={{ color: '#00D4FF' }}>📶 EDGE LOCAL</span>
        </div>

        {/* Live Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(74,222,128,0.12)',
            border: '1px solid rgba(74,222,128,0.3)',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#4ADE80',
              animation: 'breathe 1.5s ease-in-out infinite',
              boxShadow: '0 0 8px #4ADE80',
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>
            COMMAND CENTER
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
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 15,
                  height: 15,
                  borderRadius: '50%',
                  background: '#FF6B6B',
                  color: 'white',
                  fontSize: 9,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications}
              </span>
            )}
          </button>

          {/* Notif Dropdown */}
          {showNotifs && (
            <div
              style={{
                position: 'absolute', right: 0, top: 48, width: 300,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
                borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)',
                boxShadow: '-10px -10px 24px rgba(255,255,255,0.95), 10px 10px 24px rgba(0,0,0,0.1)',
                padding: 16, zIndex: 100,
                animation: 'fade-in 0.25s ease',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Notifications</div>
              {[
                { title: 'Survivor A confirmed', time: '2m ago', color: '#4ADE80' },
                { title: 'Audio anomaly in Room 302', time: '5m ago', color: '#FBBF24' },
                { title: 'ESP32 #4 signal weak', time: '12m ago', color: '#FF6B6B' },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{n.title}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 5px',
            borderRadius: 18,
            background: 'var(--card)',
            boxShadow: 'var(--shadow-neu)',
            border: 'var(--glass-border)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: 'white',
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
