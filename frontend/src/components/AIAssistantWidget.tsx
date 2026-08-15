'use client';

import React, { useState } from 'react'

interface AIAssistantWidgetProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
}

export default function AIAssistantWidget({ systemMode = 'OFFLINE' }: AIAssistantWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: systemMode === 'OFFLINE' 
        ? 'HEGEMA Command AI Assistant online. System is currently OFFLINE (No physical hardware connected). Connect an ESP32 sniffer or click Start Simulation to begin sensing.' 
        : `HEGEMA Command AI Assistant online in ${systemMode} mode. How can I assist with spatial estimation or mission reporting?` }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }])
    setInput('')

    setTimeout(() => {
      let reply = 'System is OFFLINE. No live sensor telemetry available to perform analysis.'
      if (systemMode !== 'OFFLINE') {
        reply = `Analyzing ${systemMode} telemetry... Spatial Occupancy confidence evaluated at 87% across Building 7 Floor 3.`
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }])
    }, 600)
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {open ? (
        <div style={{
          width: 340, height: 420, borderRadius: 20, background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>HEGEMA AI Assistant</div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>{systemMode} MODE</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                background: m.sender === 'user' ? '#4F8CFF' : '#F1F5F9',
                color: m.sender === 'user' ? 'white' : '#0F172A',
                padding: '8px 12px', borderRadius: 12, fontSize: 11, maxWidth: '85%'
              }}>
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: 10, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask HEGEMA AI..."
              style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1', fontSize: 11, outline: 'none' }}
            />
            <button onClick={handleSend} style={{ padding: '8px 14px', borderRadius: 10, background: '#4F8CFF', color: 'white', border: 'none', fontWeight: 700, fontSize: 11, cursor: 'pointer' }}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
            color: 'white', border: 'none', boxShadow: '0 8px 24px rgba(79,140,255,0.4)',
            cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          🤖
        </button>
      )}
    </div>
  )
}
