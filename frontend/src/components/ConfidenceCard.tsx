'use client';

import React from 'react';

interface ConfidenceCardProps {
  probability: string;
  confidence: string;
  scenario: string;
  probDistribution?: Record<string, number>;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  probability,
  confidence,
  probDistribution,
}) => {
  const topZones = probDistribution
    ? Object.entries(probDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [
        ['Zone_X0_Y32', 0.2],
        ['Zone_X12_Y16', 0.2],
        ['Zone_X0_Y23', 0.2],
      ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-4 shadow-xl">
          <p className="text-xs font-mono text-slate-400 uppercase">Top Spatial Zone</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-rose-400 truncate">
              {topZones[0]?.[0] || 'Zone_X0_Y32'}
            </span>
          </div>
        </div>

        <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-4 shadow-xl">
          <p className="text-xs font-mono text-slate-400 uppercase">Zone Confidence</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {topZones[0]?.[1] ? `${(Number(topZones[0][1]) * 100).toFixed(0)}%` : '20%'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">TOP MATCH</span>
          </div>
        </div>
      </div>

      {/* Top 3 Probable Occupancy Zones Candidate List */}
      <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-4 shadow-xl space-y-2">
        <div className="flex items-center justify-between border-b border-[#1F293D] pb-2">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
            Top 3 Candidate Zones
          </span>
          <span className="text-[10px] font-mono text-slate-400">MODEL PROBABILITIES</span>
        </div>
        <div className="space-y-1.5 font-mono text-xs">
          {topZones.map(([zone, prob], idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#090D16] px-2.5 py-1.5 rounded border border-[#1F293D]">
              <span className="text-slate-300">
                <span className="text-cyan-400 font-bold mr-2">#{idx + 1}</span>
                {zone}
              </span>
              <span className="text-emerald-400 font-semibold">{(Number(prob) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
