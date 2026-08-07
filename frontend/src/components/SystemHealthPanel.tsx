'use client';

import React from 'react';

interface SystemHealthPanelProps {
  esp32Status?: boolean;
  androidStatus?: boolean;
  mqttStatus?: boolean;
  aiStatus?: boolean;
  backendStatus?: boolean;
  dashboardStatus?: boolean;
  lastUpdateMs?: number;
  packetsReceived?: number;
  inferenceTimeMs?: number;
}

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  lastUpdateMs = 10,
  packetsReceived = 15234,
  inferenceTimeMs = 0.05,
}) => {
  const sensorModalities = [
    { name: 'Wi-Fi RSSI', dataset: 'Loaded (119,968 rows)', status: 'Dataset Active' },
    { name: 'BLE RSSI', dataset: 'Loaded (5,000 rows)', status: 'Dataset Active' },
    { name: 'Audio Acoustic', dataset: 'Loaded (5,000 rows)', status: 'Dataset Active' },
    { name: 'IMU Motion', dataset: 'Loaded (5,000 rows)', status: 'Dataset Active' },
  ];

  return (
    <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
        <h3 className="text-xs font-semibold text-cyan-400 font-mono tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Multi-Sensor Fusion & System Health Panel
        </h3>
        <span className="text-[10px] font-mono text-slate-400">EDGE PIPELINE</span>
      </div>

      {/* Sensor Modalities Availability Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {sensorModalities.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#090D16] border border-[#1F293D] rounded-lg p-2.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-200 font-bold">{item.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-[9px] font-mono text-cyan-400/80 mt-1">{item.dataset}</p>
            <span className="text-[9px] font-mono text-emerald-400 mt-0.5 font-semibold">
              ✓ {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1F293D] text-[10px] font-mono text-slate-400 text-center">
        <div>
          <span>LAST UPDATE</span>
          <p className="text-cyan-400 font-bold text-xs">{lastUpdateMs} ms ago</p>
        </div>
        <div>
          <span>PACKETS INGESTED</span>
          <p className="text-emerald-400 font-bold text-xs">{packetsReceived.toLocaleString()}</p>
        </div>
        <div>
          <span>INFERENCE LATENCY</span>
          <p className="text-purple-400 font-bold text-xs">{inferenceTimeMs} ms</p>
        </div>
      </div>
    </div>
  );
};
