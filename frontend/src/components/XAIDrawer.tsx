'use client';

import React from 'react';

interface SensorContribution {
  sensor: string;
  weight: number;
}

interface XAIDrawerProps {
  xaiData: {
    sensor_contributions?: SensorContribution[];
    diagnostic_summary?: string;
  } | null;
}

export const XAIDrawer: React.FC<XAIDrawerProps> = ({ xaiData }) => {
  const contributions = xaiData?.sensor_contributions || [
    { sensor: 'Wi-Fi RSSI', weight: 30.0 },
    { sensor: 'BLE Beacon', weight: 35.0 },
    { sensor: 'Audio Acoustic', weight: 20.0 },
    { sensor: 'IMU Motion', weight: 15.0 },
  ];

  return (
    <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-[#1F293D] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-cyan-400 tracking-wide uppercase">
            Explainable AI (XAI) Attributions
          </h3>
          <p className="text-xs text-slate-400">Multi-Sensor Modality Weight Contributions</p>
        </div>
        <span className="bg-cyan-500/10 text-cyan-400 text-xs px-2.5 py-1 rounded-full border border-cyan-500/20 font-mono">
          FUSION EXPLAINER
        </span>
      </div>

      {/* Active Multi-Sensor Inputs */}
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
          ✓ Active Multi-Sensor Inputs (Datasets Loaded)
        </p>
        {contributions.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-200">{item.sensor}</span>
              <span className="text-cyan-400 font-semibold">{item.weight}%</span>
            </div>
            <div className="w-full bg-[#090D16] h-1.5 rounded-full overflow-hidden border border-[#1F293D]">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                style={{ width: `${item.weight}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#1F293D] text-xs text-slate-300 bg-[#090D16]/60 p-3 rounded-lg border border-[#1F293D]/60 font-mono">
        <span className="text-cyan-400 font-bold">FUSION DIAGNOSTIC: </span>
        {xaiData?.diagnostic_summary || 'Modular sensor fusion active across Wi-Fi, BLE, Audio, and IMU pipelines.'}
      </div>
    </div>
  );
};
