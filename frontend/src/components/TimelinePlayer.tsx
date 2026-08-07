'use client';

import React from 'react';

interface TimelinePlayerProps {
  timeStep: number;
  timestampStr: string;
  onStep: () => void;
}

export const TimelinePlayer: React.FC<TimelinePlayerProps> = ({ timeStep, timestampStr, onStep }) => {
  return (
    <div className="bg-[#121826] border border-[#1F293D] rounded-xl p-4 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onStep}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          ▶ STEP SIMULATION
        </button>
        <span className="text-xs font-mono text-slate-400">
          STEP: <strong className="text-cyan-400">{timeStep}</strong>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] uppercase font-mono text-slate-400">Spatial Timeline</p>
          <p className="text-sm font-mono text-cyan-300 font-bold">{timestampStr || '10:00 AM'}</p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className={`px-2 py-1 rounded text-[11px] ${timeStep < 5 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-500'}`}>10:00</span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-1 rounded text-[11px] ${timeStep >= 5 && timeStep < 12 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500'}`}>10:05</span>
          <span className="text-slate-600">→</span>
          <span className={`px-2 py-1 rounded text-[11px] ${timeStep >= 12 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-500'}`}>10:10</span>
        </div>
      </div>
    </div>
  );
};
