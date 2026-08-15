'use client';

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useHEGEMARuntime } from '../context/RuntimeContext'

type Page = 'dashboard' | 'analytics' | 'dataset' | 'settings'

const navItems = [
  { id: 'dashboard', icon: '⌂', label: 'Dashboard', path: '/' },
  { id: 'analytics', icon: '◈', label: 'Analytics', path: '/analytics' },
  { id: 'dataset', icon: '▦', label: 'Dataset', path: '/dataset' },
  { id: 'settings', icon: '⚙', label: 'Settings', path: '/settings' },
] as const

interface SidebarProps {
  page?: Page
  onNavigate?: (p: Page) => void
}

export default function Sidebar({ page, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const runtime = useHEGEMARuntime()
  const { systemMode, mission, selected_map, hardware_summary, services } = runtime

  const getMissionBadge = () => {
    if (mission.status === 'ACTIVE') {
      return { label: 'MISSION ACTIVE', color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.2)' }
    }
    if (mission.status === 'WAITING_FOR_HARDWARE') {
      return { label: 'WAITING FOR HARDWARE', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)' }
    }
    if (mission.status === 'PAUSED') {
      return { label: 'MISSION PAUSED', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)' }
    }
    return { label: 'MISSION IDLE', color: '#94A3B8', bg: '#F1F5F9', border: '#E2E8F0' }
  }

  const badge = getMissionBadge()

  return (
    <aside
      style={{
        width: collapsed ? 72 : 240,
        minHeight: '100vh',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.85)',
        boxShadow: '4px 0 24px rgba(79,140,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        transition: 'width 0.35s cubic-bezier(0.34,1.2,0.64,1)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? '0 16px' : '0 24px', marginBottom: 32 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => setCollapsed(!collapsed)}
          title="Click to collapse / expand navigation"
        >
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 16px rgba(79,140,255,0.35)',
              fontSize: 18, fontWeight: 800, color: 'white', fontStyle: 'italic',
            }}
          >
            H
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
                HEGEMA
              </div>
              <div style={{ fontSize: 10, color: '#6B7280', letterSpacing: 0.5, fontWeight: 500 }}>
                RESCUE AI
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Status Badge */}
      {!collapsed && (
        <Link
          href="/"
          style={{
            margin: '0 16px 20px',
            padding: '12px 16px',
            borderRadius: 16,
            background: badge.bg,
            border: `1px solid ${badge.border}`,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'block',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: badge.color,
                animation: mission.status === 'ACTIVE' ? 'breathe 2s ease-in-out infinite' : 'none',
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 800, color: badge.color, letterSpacing: 0.5 }}>
              {badge.label}
            </span>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
            Map: {selected_map.building} · {selected_map.floor}
          </div>
        </Link>
      )}

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = page ? page === item.id : (pathname === item.path || (pathname === '/' && item.id === 'dashboard'))
          return (
            <Link
              key={item.id}
              href={item.path}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(item.id)
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: 16, border: 'none', cursor: 'pointer',
                background: active ? 'linear-gradient(135deg, #4F8CFF 0%, #6fa3ff 100%)' : 'transparent',
                color: active ? 'white' : '#6B7280',
                fontWeight: active ? 600 : 500, fontSize: 14,
                textAlign: 'left', width: '100%',
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                boxShadow: active ? '0 6px 20px rgba(79,140,255,0.3)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Authoritative System Status Indicators */}
      {!collapsed && (
        <div style={{ padding: '0 16px', marginTop: 'auto' }}>
          <Link
            href="/settings"
            style={{
              padding: '12px 16px',
              borderRadius: 16,
              background: 'rgba(246,248,251,0.8)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'block',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 8, letterSpacing: 0.5 }}>SYSTEM STATUS</div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#111827' }}>ESP32 Nodes</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: hardware_summary.esp32_count > 0 ? '#4ADE80' : '#94A3B8' }} />
                <span style={{ fontSize: 10, color: hardware_summary.esp32_count > 0 ? '#059669' : '#64748B', fontWeight: 700 }}>
                  {hardware_summary.esp32_count > 0 ? `${hardware_summary.esp32_count} ONLINE` : 'OFFLINE'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#111827' }}>MQTT Broker</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: hardware_summary.mqtt_connected ? '#4ADE80' : '#94A3B8' }} />
                <span style={{ fontSize: 10, color: hardware_summary.mqtt_connected ? '#059669' : '#64748B', fontWeight: 700 }}>
                  {hardware_summary.mqtt_connected ? 'ONLINE' : 'DISCONNECTED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#111827' }}>AI Model Zoo</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: services.ai_engine === 'ACTIVE' ? '#4ADE80' : '#60A5FA' }} />
                <span style={{ fontSize: 10, color: services.ai_engine === 'ACTIVE' ? '#059669' : '#2563EB', fontWeight: 700 }}>
                  {services.ai_engine}
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </aside>
  )
}
