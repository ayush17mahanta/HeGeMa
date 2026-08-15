'use client';

import { useHEGEMARuntime } from '../context/RuntimeContext';

export default function HardwareView() {
  const runtime = useHEGEMARuntime();
  const { systemMode, hardware_summary, devices, services } = runtime;

  const isOffline = systemMode === 'OFFLINE';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 4 }}>
          Hardware & Edge Node Diagnostics
        </div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>
          Authoritative Hardware Verification & Real Device Telemetry Matrix
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          {
            label: 'Active ESP32 Nodes',
            value: `${hardware_summary.esp32_count} Online`,
            sub: hardware_summary.esp32_count > 0 ? 'Verified Hardware Ping' : 'No Hardware Connected',
            color: hardware_summary.esp32_count > 0 ? '#4ADE80' : '#94A3B8',
          },
          {
            label: 'Android Devices',
            value: `${hardware_summary.android_count} Online`,
            sub: hardware_summary.android_count > 0 ? 'Sensor App Streaming' : 'Waiting for Device',
            color: hardware_summary.android_count > 0 ? '#4F8CFF' : '#94A3B8',
          },
          {
            label: 'CSI Subcarrier Nodes',
            value: `${hardware_summary.csi_node_count} Active`,
            sub: hardware_summary.csi_node_count > 0 ? 'HT20 Subcarrier Sniffer' : 'CSI Unavailable',
            color: hardware_summary.csi_node_count > 0 ? '#06B6D4' : '#94A3B8',
          },
          {
            label: 'Local Backend',
            value: services.local_backend,
            sub: services.mqtt_broker,
            color: '#4ADE80',
          },
        ].map(card => (
          <div key={card.label} className="neu-card card-hover" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 }}>
              {card.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', letterSpacing: -0.5 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: card.color, fontWeight: 600, marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Verified Nodes Table */}
      <div className="neu-card" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Verified Hardware Registry</div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>Heartbeat authenticated physical devices (&lt;10s age)</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 12,
            background: isOffline ? '#F1F5F9' : '#ECFDF5',
            color: isOffline ? '#94A3B8' : '#059669',
            border: isOffline ? '1px solid #E2E8F0' : '1px solid #A7F3D0',
          }}>
            {isOffline ? '0 DEVICES CONNECTED' : `${devices.length} VERIFIED DEVICES`}
          </span>
        </div>

        {devices.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#475569' }}>NO PHYSICAL HARDWARE DETECTED</p>
            <p style={{ margin: '6px 0 0 0', fontSize: 11, color: '#94A3B8' }}>
              Connect an ESP32 sniffer node via USB/Wi-Fi or launch the Android Collector app to populate verified device heartbeats.
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Device ID', 'Type', 'Capabilities', 'IP Address', 'Last Heartbeat', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.map((dev) => (
                <tr key={dev.device_id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: '#4F8CFF' }}>{dev.device_id}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#6B7280' }}>{dev.device_type}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#6B7280' }}>{dev.capabilities?.join(', ')}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>{dev.ip || 'Local Mesh'}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#111827' }}>Just now</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: 'rgba(74,222,128,0.15)', padding: '2px 8px', borderRadius: 10 }}>
                      ● {dev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
