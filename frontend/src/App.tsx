import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './views/Dashboard'
import Analytics from './views/Analytics'
import Dataset from './views/Dataset'
import Settings from './views/Settings'

type Page = 'dashboard' | 'analytics' | 'dataset' | 'settings'

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Live Dashboard',
  analytics: 'Analytics',
  dataset: 'Dataset & Models',
  settings: 'Settings',
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [darkMode, setDarkMode] = useState(false)

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard />,
    analytics: <Analytics />,
    dataset: <Dataset />,
    settings: <Settings />,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FB', display: 'flex' }}>
      <Sidebar page={page} onNavigate={setPage} />

      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

        <main style={{ flex: 1, padding: '88px 28px 40px', maxWidth: 1400 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>HEGEMA</span>
            <span style={{ fontSize: 12, color: '#D1D5DB' }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#4F8CFF' }}>{PAGE_TITLES[page]}</span>
          </div>

          <div
            key={page}
            style={{ animation: 'fade-in 0.35s cubic-bezier(0.34,1.2,0.64,1) both' }}
          >
            {pageComponents[page]}
          </div>
        </main>
      </div>
    </div>
  )
}
