'use client';

import React, { useState } from 'react';
import './globals.css';
import { HEGEMARuntimeProvider } from '../context/RuntimeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <html lang="en" className="dark">
      <body className="bg-[#090D16] text-slate-100 font-sans min-h-screen antialiased">
        <HEGEMARuntimeProvider>
          <div style={{ minHeight: '100vh', background: '#F6F8FB', display: 'flex' }}>
            <Sidebar />
            <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
              <main style={{ flex: 1, padding: '88px 28px 40px', maxWidth: 1400 }}>
                {children}
              </main>
            </div>
          </div>
        </HEGEMARuntimeProvider>
      </body>
    </html>
  );
}
