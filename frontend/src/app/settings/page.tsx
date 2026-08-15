'use client';

import Settings from '../../views/Settings';

export default function SettingsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>HEGEMA</span>
        <span style={{ fontSize: 12, color: '#D1D5DB' }}>›</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#4F8CFF' }}>Settings</span>
      </div>
      <Settings />
    </div>
  );
}
