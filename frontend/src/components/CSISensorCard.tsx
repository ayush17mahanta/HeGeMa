import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Radio, Cpu, AlertTriangle } from 'lucide-react';

interface CSISensorCardProps {
  systemMode?: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
  packetRate?: number;
  qualityScore?: number;
  humanPresenceProb?: number;
  spatialConfidence?: number;
  subcarrierAmplitudes?: number[];
  presenceClass?: string;
}

export const CSISensorCard: React.FC<CSISensorCardProps> = ({
  systemMode = 'OFFLINE',
  packetRate = 0,
  qualityScore = 0,
  humanPresenceProb = 0,
  spatialConfidence = 0,
  subcarrierAmplitudes = [],
  presenceClass = 'NO_HUMAN_EVIDENCE'
}) => {
  const [amps, setAmps] = useState<number[]>([]);

  useEffect(() => {
    if (systemMode === 'OFFLINE') {
      setAmps([]);
    } else if (subcarrierAmplitudes && subcarrierAmplitudes.length > 0) {
      setAmps(subcarrierAmplitudes);
    } else if (systemMode === 'SIMULATION') {
      const sampleAmps = Array.from({ length: 64 }, (_, i) => 12 + 6 * Math.sin(i * 0.2) + Math.random() * 2);
      setAmps(sampleAmps);
    }
  }, [systemMode, subcarrierAmplitudes]);

  if (systemMode === 'OFFLINE') {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">CSI SENSING PLUGIN</h3>
              <p className="text-[10px] text-slate-500 font-mono">Wi-Fi Channel State Information</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>UNAVAILABLE</span>
          </div>
        </div>

        <div className="my-4 text-center py-4 bg-slate-950/40 rounded-lg border border-slate-800/80">
          <AlertTriangle className="w-6 h-6 text-slate-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">NO LIVE CSI HARDWARE CONNECTED</p>
          <p className="text-[11px] text-slate-500 mt-1">Connect a physical ESP32 CSI node or click Start Simulation to view subcarrier evidence.</p>
        </div>
      </div>
    );
  }

  const pRate = systemMode === 'SIMULATION' ? 48.2 : packetRate;
  const qScore = systemMode === 'SIMULATION' ? 0.92 : qualityScore;
  const pProb = systemMode === 'SIMULATION' ? 0.82 : humanPresenceProb;
  const sConf = systemMode === 'SIMULATION' ? 0.74 : spatialConfidence;

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 backdrop-blur-md shadow-lg shadow-cyan-950/20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">CSI NODE 01</h3>
              <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {systemMode}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Wi-Fi Channel State Information</p>
          </div>
        </div>

        <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-full border text-[10px] font-mono font-bold ${
          systemMode === 'REAL' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-ping ${systemMode === 'REAL' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{systemMode === 'REAL' ? 'ONLINE' : 'SIMULATION'}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 my-3">
        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-[9px] uppercase font-mono text-slate-400">Packets/sec</p>
          <p className="text-base font-bold font-mono text-cyan-400">{pRate.toFixed(1)}</p>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-[9px] uppercase font-mono text-slate-400">Signal Quality</p>
          <p className="text-base font-bold font-mono text-cyan-400">{(qScore * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-[9px] uppercase font-mono text-slate-400">Human Presence</p>
          <p className="text-base font-bold font-mono text-emerald-400">{(pProb * 100).toFixed(0)}%</p>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800">
          <p className="text-[9px] uppercase font-mono text-slate-400">Spatial Conf</p>
          <p className="text-base font-bold font-mono text-indigo-400">{(sConf * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Subcarrier Waveform */}
      <div>
        <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-slate-400">
          <span>64 Subcarrier Waveform</span>
          <span>HT20 / 2.4 GHz</span>
        </div>
        <div className="h-14 bg-slate-950/80 rounded-lg border border-slate-800/80 p-1.5 flex items-end justify-between space-x-0.5 overflow-hidden">
          {amps.map((amp, idx) => {
            const heightPct = Math.min(100, Math.max(10, (amp / 30.0) * 100));
            return (
              <div
                key={idx}
                className="w-full bg-gradient-to-t from-cyan-600 via-cyan-400 to-emerald-400 rounded-t-sm transition-all duration-300 hover:brightness-125"
                style={{ height: `${heightPct}%` }}
                title={`Subcarrier ${idx + 1}: ${amp.toFixed(1)} dB`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
