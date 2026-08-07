'use client';

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

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

export default function Sidebar({ page }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleNav = (itemPath: string) => {
    router.push(itemPath)
  }

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
      <div style={{ padding: collapsed ? '0 16px' : '0 24px', marginBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
          onClick={() => setCollapsed(!collapsed)}
          title="Click to collapse / expand navigation"
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(79,140,255,0.35)',
              fontSize: 18,
              fontWeight: 800,
              color: 'white',
              fontStyle: 'italic',
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

      {/* Mission Status */}
      {!collapsed && (
        <div
          style={{
            margin: '0 16px 24px',
            padding: '12px 16px',
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(0,212,255,0.08) 100%)',
            border: '1px solid rgba(74,222,128,0.2)',
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4ADE80',
                animation: 'breathe 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80' }}>MISSION ACTIVE</span>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>Building 7 · Floor 3</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const active = pathname === item.path || (pathname === '/' && item.id === 'dashboard')
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.path)}
              className="sidebar-icon-btn ripple-container"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: 16,
                border: 'none',
                cursor: 'pointer',
                background: active
                  ? 'linear-gradient(135deg, #4F8CFF 0%, #6fa3ff 100%)'
                  : 'transparent',
                color: active ? 'white' : '#6B7280',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                textAlign: 'left',
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                boxShadow: active ? '0 6px 20px rgba(79,140,255,0.3)' : 'none',
                transition: 'all 0.25s cubic-bezier(0.34,1.2,0.64,1)',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.8)',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom status */}
      {!collapsed && (
        <div style={{ padding: '0 16px', marginTop: 'auto' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 16,
              background: 'rgba(246,248,251,0.8)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '-4px -4px 10px rgba(255,255,255,0.9), 4px 4px 10px rgba(0,0,0,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => router.push('/')}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>SYSTEM STATUS</div>
            {['ESP32 Node', 'MQTT Broker', 'AI Model Zoo'].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#111827' }}>{s}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', animation: 'breathe 2.5s infinite' }} />
                  <span style={{ fontSize: 10, color: '#4ADE80', fontWeight: 600 }}>LIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
