'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Settings from '../../views/Settings';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FB', display: 'flex' }}>
      <Sidebar page="settings" onNavigate={(p) => window.location.href = p === 'dashboard' ? '/' : `/${p}`} />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
        <main style={{ flex: 1, padding: '88px 28px 40px', maxWidth: 1400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>HEGEMA</span>
            <span style={{ fontSize: 12, color: '#D1D5DB' }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4F8CFF' }}>Settings</span>
          </div>
          <Settings />
        </main>
      </div>
    </div>
  );
}
