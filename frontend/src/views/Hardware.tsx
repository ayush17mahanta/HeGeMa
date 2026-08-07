'use client';

import { useState } from 'react';

const ESP32_NODES = [
  { id: 'ESP32-NODE-01', ip: '192.168.1.101', mac: '24:6F:28:AB:1C:01', rssi: -61, battery: 94, packets: 4218, loss: '0.01%', status: 'ONLINE', firmware: 'v3.2-HAL' },
  { id: 'ESP32-NODE-02', ip: '192.168.1.102', mac: '24:6F:28:AB:1C:02', rssi: -68, battery: 88, packets: 3982, loss: '0.02%', status: 'ONLINE', firmware: 'v3.2-HAL' },
  { id: 'ESP32-NODE-03', ip: '192.168.1.103', mac: '24:6F:28:AB:1C:03', rssi: -64, battery: 91, packets: 4102, loss: '0.00%', status: 'ONLINE', firmware: 'v3.2-HAL' },
  { id: 'ESP32-NODE-04', ip: '192.168.1.104', mac: '24:6F:28:AB:1C:04', rssi: -72, battery: 79, packets: 3840, loss: '0.04%', status: 'ONLINE', firmware: 'v3.2-HAL' },
  { id: 'ESP32-NODE-05', ip: '192.168.1.105', mac: '24:6F:28:AB:1C:05', rssi: -65, battery: 85, packets: 4011, loss: '0.01%', status: 'ONLINE', firmware: 'v3.2-HAL' },
  { id: 'ESP32-NODE-06', ip: '192.168.1.106', mac: '24:6F:28:AB:1C:06', rssi: -70, battery: 82, packets: 3910, loss: '0.03%', status: 'ONLINE', firmware: 'v3.2-HAL' },
];

export default function HardwareView() {
  const [selectedNode, setSelectedNode] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: -1, marginBottom: 4 }}>Hardware & Edge Node Diagnostics</div>
        <div style={{ fontSize: 13, color: '#6B7280' }}>Physical ESP32 Sniffers & Android Field Devices</div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Active ESP32 Nodes', value: '6 / 6', sub: '100% Operational', color: '#4ADE80' },
          { label: 'Android Phones', value: '3 Active', sub: 'BLE + IMU + Mic Live', color: '#4F8CFF' },
          { label: 'Avg Packet Loss', value: '0.02%', sub: 'Zero-Trust Local Mesh', color: '#00D4FF' },
          { label: 'MQTT Latency', value: '3 ms', sub: 'Port 1883 Direct', color: '#FBBF24' },
        ].map(card => (
          <div key={card.label} className="neu-card card-hover" style={{ padding: '20px 22px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 }}>
              {card.label.toUpperCase()}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: -1 }}>{card.value}</div>
            <div style={{ fontSize: 11, color: card.color, fontWeight: 600, marginTop: 4 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Nodes Table & Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* ESP32 Nodes Table */}
        <div className="neu-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>ESP32 Promiscuous Nodes</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Node ID', 'IP Address', 'MAC', 'RSSI', 'Battery', 'Packets', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 10, fontWeight: 700, color: '#9CA3AF', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ESP32_NODES.map((n, idx) => (
                <tr
                  key={n.id}
                  onClick={() => setSelectedNode(idx)}
                  style={{
                    cursor: 'pointer',
                    background: selectedNode === idx ? 'rgba(79,140,255,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(0,0,0,0.03)'
                  }}
                >
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: '#4F8CFF' }}>{n.id}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#6B7280' }}>{n.ip}</td>
                  <td style={{ padding: '12px', fontSize: 11, color: '#6B7280', fontFamily: 'monospace' }}>{n.mac}</td>
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: '#111827' }}>{n.rssi} dBm</td>
                  <td style={{ padding: '12px', fontSize: 12, fontWeight: 700, color: '#4ADE80' }}>{n.battery}%</td>
                  <td style={{ padding: '12px', fontSize: 12, color: '#111827' }}>{n.packets.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', background: 'rgba(74,222,128,0.15)', padding: '2px 8px', borderRadius: 10 }}>
                      ● {n.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Node Inspector */}
        <div className="neu-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Node Inspector</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>{ESP32_NODES[selectedNode].id}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Firmware Version', val: ESP32_NODES[selectedNode].firmware },
              { label: 'MAC Address', val: ESP32_NODES[selectedNode].mac },
              { label: 'Signal Strength (RSSI)', val: `${ESP32_NODES[selectedNode].rssi} dBm` },
              { label: 'Battery Capacity', val: `${ESP32_NODES[selectedNode].battery}%` },
              { label: 'Packet Loss Rate', val: ESP32_NODES[selectedNode].loss },
              { label: 'Total Ingested Packets', val: ESP32_NODES[selectedNode].packets.toLocaleString() },
              { label: 'Last Heartbeat Ping', val: '250 ms ago' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(246,248,251,0.8)', borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{item.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{item.val}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={() => alert(`Ping request sent to ${ESP32_NODES[selectedNode].id} (192.168.1.101)`)}
            style={{ width: '100%', marginTop: 20, padding: '10px 0', fontSize: 13 }}
          >
            ⚡ Ping Node
          </button>
        </div>
      </div>
    </div>
  );
}
