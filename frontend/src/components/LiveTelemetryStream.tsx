'use client';

import { useState, useEffect } from 'react';

export default function LiveTelemetryStream() {
  const [telemetry, setTelemetry] = useState([
    { sensor: 'Wi-Fi RSSI Node #1', value: '-61 dBm', status: 'Optimal', color: '#4ADE80' },
    { sensor: 'Wi-Fi RSSI Node #2', value: '-68 dBm', status: 'Good', color: '#4ADE80' },
    { sensor: 'BLE Beacon Sniffer', value: '-74 dBm', status: 'Stable', color: '#00D4FF' },
    { sensor: 'Smartphone Mic RMS', value: '0.24 RMS (52 dB)', status: 'Acoustic Detected', color: '#FBBF24' },
    { sensor: 'Android IMU Accelerometer', value: '0.003 g (Linear)', status: 'Quiet', color: '#4F8CFF' },
    { sensor: 'Packet Throughput', value: '1,847 pkts/min', status: '100% Delivery', color: '#4ADE80' },
  ]);

  const [logs, setLogs] = useState([
    { time: '13:31:02', event: 'Packet Ingested from ESP32 Node #1 (-61 dBm)', type: 'info' },
    { time: '13:31:05', event: 'BLE Beacon RSSI Attenuation Updated (-74 dBm)', type: 'info' },
    { time: '13:31:08', event: 'Acoustic Harmonic Detected in Room 301', type: 'warning' },
    { time: '13:31:12', event: 'AI Model Zoo Prediction: Room 301 (94% Confidence)', type: 'success' },
    { time: '13:31:15', event: 'Mission Log Saved to data_lake/missions/', type: 'success' },
  ]);

  useEffect(() => {
    const t = setInterval(() => {
      // Simulate live fluctuating telemetry values
      setTelemetry(prev => prev.map(item => {
        if (item.sensor.includes('Wi-Fi')) {
          const val = Math.floor(-60 - Math.random() * 12);
          return { ...item, value: `${val} dBm` };
        }
        if (item.sensor.includes('BLE')) {
          const val = Math.floor(-70 - Math.random() * 10);
          return { ...item, value: `${val} dBm` };
        }
        if (item.sensor.includes('Mic')) {
          const rms = (0.2 + Math.random() * 0.1).toFixed(2);
          return { ...item, value: `${rms} RMS` };
        }
        return item;
      }));

      // Append new event log periodically
      const now = new Date().toTimeString().split(' ')[0];
      setLogs(prev => [
        { time: now, event: `Live Telemetry Sync — Packet #${Math.floor(1800 + Math.random() * 100)} Verified`, type: 'info' },
        ...prev.slice(0, 7)
      ]);
    }, 2500);

    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Sensor Stream Card */}
      <div className="neu-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Live Sensor Telemetry Stream</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Real-time hardware signal metrics</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4ADE80', background: 'rgba(74,222,128,0.12)', padding: '4px 10px', borderRadius: 12, border: '1px solid rgba(74,222,128,0.25)' }}>
            ● STREAMING
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {telemetry.map((t, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'rgba(246,248,251,0.8)',
                border: '1px solid rgba(255,255,255,0.9)',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
                <span style={{ fontWeight: 600, color: '#111827' }}>{t.sensor}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 700, color: '#4F8CFF', fontVariantNumeric: 'tabular-nums' }}>{t.value}</span>
                <span style={{ fontSize: 10, color: '#6B7280' }}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Event Log */}
      <div className="neu-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Command Center Operations Log</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Timestamped event audit log</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#4F8CFF', background: 'rgba(79,140,255,0.1)', padding: '4px 10px', borderRadius: 12, border: '1px solid rgba(79,140,255,0.2)' }}>
            ZERO-TRUST LOG
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
          {logs.map((log, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                borderRadius: 10,
                background: 'white',
                border: '1px solid rgba(0,0,0,0.04)',
                fontSize: 11,
              }}
            >
              <span style={{ fontWeight: 700, color: '#4F8CFF', fontVariantNumeric: 'tabular-nums', minWidth: 55 }}>
                {log.time}
              </span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: log.type === 'success' ? '#4ADE80' : log.type === 'warning' ? '#FBBF24' : '#00D4FF' }} />
              <span style={{ color: '#111827', fontWeight: 500 }}>{log.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
