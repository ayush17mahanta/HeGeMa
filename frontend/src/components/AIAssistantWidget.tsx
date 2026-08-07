'use client';

import { useState } from 'react';

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'HEGEMA Rescue AI active. I am monitoring 4 multi-sensor streams across Building 7 Floor 3. How can I assist search operations?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    let aiReply = 'Analyzing live telemetry... Room 301 displays the highest survivor occupancy probability (94%) based on Wi-Fi RSSI attenuation (-62dB) and acoustic harmonics.';

    if (query.toLowerCase().includes('search')) {
      aiReply = 'Priority Search Order: 1. Room 301 (94% confidence, BLE+Audio), 2. Room 303 (87% confidence, Wi-Fi), 3. Room 302 (78% confidence). Dispatch Team A to Room 301 immediately.';
    } else if (query.toLowerCase().includes('explain')) {
      aiReply = 'XAI Attribution Explanation: Room 301 signal spike caused by Wi-Fi RSSI attenuation (41.3%), BLE beacon stability (35.0%), and acoustic frequency match (21.5%).';
    } else if (query.toLowerCase().includes('export')) {
      aiReply = 'Generating research & mission package JSON. Click "Export Report" in the Hero banner to download.';
    }

    setMessages(prev => [...prev, userMsg, { sender: 'ai', text: aiReply }]);
    if (!textToSend) setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="btn-primary ripple-container"
          style={{
            padding: '14px 22px',
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 10px 30px rgba(79,140,255,0.4)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 18, animation: 'breathe 2s infinite' }}>🤖</span>
          <span>HEGEMA AI Assistant</span>
        </button>
      ) : (
        <div
          className="neu-card"
          style={{
            width: 380,
            maxHeight: 520,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            boxShadow: '-10px -10px 30px rgba(255,255,255,0.95), 10px 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid rgba(79,140,255,0.3)',
            animation: 'fade-in 0.3s cubic-bezier(0.34,1.2,0.64,1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #4F8CFF 0%, #00D4FF 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>HEGEMA Rescue AI</div>
                <div style={{ fontSize: 10, opacity: 0.8, fontWeight: 500 }}>Command & Control Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, background: '#F6F8FB' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: m.sender === 'user' ? '#4F8CFF' : 'white',
                  color: m.sender === 'user' ? 'white' : '#111827',
                  fontSize: 12,
                  lineHeight: 1.5,
                  boxShadow: m.sender === 'user' ? '0 4px 12px rgba(79,140,255,0.3)' : '-2px -2px 6px rgba(255,255,255,0.9), 2px 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Prompt Suggestions */}
          <div style={{ padding: '8px 12px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {['Where to search?', 'Explain prediction', 'Export report'].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                style={{
                  padding: '4px 10px', borderRadius: 12, border: '1px solid rgba(79,140,255,0.2)',
                  background: 'rgba(79,140,255,0.06)', color: '#4F8CFF', fontSize: 10, fontWeight: 600,
                  whiteSpace: 'nowrap', cursor: 'pointer'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div style={{ padding: 12, background: 'white', display: 'flex', gap: 8, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <input
              type="text"
              placeholder="Ask HEGEMA AI..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.1)',
                outline: 'none',
                fontSize: 12,
                color: '#111827',
              }}
            />
            <button
              onClick={() => handleSend()}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: 12 }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
