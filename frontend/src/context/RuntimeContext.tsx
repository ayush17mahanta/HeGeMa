'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HEGEMARuntimeState {
  systemMode: 'OFFLINE' | 'REAL' | 'SIMULATION' | 'ERROR';
  mission: {
    status: 'IDLE' | 'STARTING' | 'WAITING_FOR_HARDWARE' | 'ACTIVE' | 'PAUSED' | 'STOPPED';
    mission_id: string | null;
    elapsed_seconds: number;
  };
  selected_map: {
    building: string;
    floor: string;
  };
  location: {
    latitude?: number;
    longitude?: number;
    source: string;
    label: string;
  } | null;
  services: {
    local_backend: string;
    mqtt_broker: string;
    ai_engine: string;
  };
  hardware_summary: {
    esp32_count: number;
    android_count: number;
    csi_node_count: number;
    mqtt_connected: boolean;
    backend_online: boolean;
  };
  telemetry_metrics: {
    total_real_packets: number;
    packets_per_minute: number;
    total_real_inferences: number;
  };
  devices: any[];
  startMission: () => Promise<any>;
  stopMission: () => Promise<any>;
  startSimulation: (scenario?: string) => Promise<any>;
  stopSimulation: () => Promise<any>;
}

const defaultRuntime: HEGEMARuntimeState = {
  systemMode: 'OFFLINE',
  mission: {
    status: 'IDLE',
    mission_id: null,
    elapsed_seconds: 0,
  },
  selected_map: {
    building: 'Building 7',
    floor: 'Floor 3',
  },
  location: null,
  services: {
    local_backend: 'ONLINE (PORT 8000)',
    mqtt_broker: 'DISCONNECTED',
    ai_engine: 'READY',
  },
  hardware_summary: {
    esp32_count: 0,
    android_count: 0,
    csi_node_count: 0,
    mqtt_connected: false,
    backend_online: true,
  },
  telemetry_metrics: {
    total_real_packets: 0,
    packets_per_minute: 0.0,
    total_real_inferences: 0,
  },
  devices: [],
  startMission: async () => {},
  stopMission: async () => {},
  startSimulation: async () => {},
  stopSimulation: async () => {},
};

const RuntimeContext = createContext<HEGEMARuntimeState>(defaultRuntime);

export const HEGEMARuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runtime, setRuntime] = useState<HEGEMARuntimeState>(defaultRuntime);

  const fetchRuntimeState = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/system/mode');
      if (res.ok) {
        const data = await res.json();
        setRuntime(prev => ({
          ...prev,
          systemMode: data.system_mode || 'OFFLINE',
          mission: {
            status: data.mission?.status || 'IDLE',
            mission_id: data.mission?.mission_id || null,
            elapsed_seconds: data.mission?.elapsed_seconds || 0,
          },
          selected_map: data.selected_map || { building: 'Building 7', floor: 'Floor 3' },
          location: data.location || null,
          services: data.services || {
            local_backend: 'ONLINE (PORT 8000)',
            mqtt_broker: 'DISCONNECTED',
            ai_engine: 'READY',
          },
          hardware_summary: data.hardware_summary || {
            esp32_count: 0,
            android_count: 0,
            csi_node_count: 0,
            mqtt_connected: false,
            backend_online: true,
          },
          telemetry_metrics: data.telemetry_metrics || {
            total_real_packets: 0,
            packets_per_minute: 0.0,
            total_real_inferences: 0,
          },
          devices: data.devices || [],
        }));
      }
    } catch (e) {
      setRuntime(prev => ({
        ...prev,
        systemMode: 'OFFLINE',
        mission: { status: 'IDLE', mission_id: null, elapsed_seconds: 0 },
        services: { local_backend: 'OFFLINE', mqtt_broker: 'DISCONNECTED', ai_engine: 'OFFLINE' },
      }));
    }
  };

  useEffect(() => {
    fetchRuntimeState();
    const interval = setInterval(fetchRuntimeState, 2000);
    return () => clearInterval(interval);
  }, []);

  const startMission = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/mission/start', { method: 'POST' });
      const data = await res.json();
      await fetchRuntimeState();
      return data;
    } catch (e) {
      return { status: 'ERROR', message: 'Backend unreachable' };
    }
  };

  const stopMission = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/mission/stop', { method: 'POST' });
      const data = await res.json();
      await fetchRuntimeState();
      return data;
    } catch (e) {
      return { status: 'ERROR' };
    }
  };

  const startSimulation = async (scenario: string = 'moving_survivors') => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/simulation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      await fetchRuntimeState();
      return data;
    } catch (e) {
      return { status: 'ERROR' };
    }
  };

  const stopSimulation = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/simulation/stop', { method: 'POST' });
      const data = await res.json();
      await fetchRuntimeState();
      return data;
    } catch (e) {
      return { status: 'ERROR' };
    }
  };

  return (
    <RuntimeContext.Provider
      value={{
        ...runtime,
        startMission,
        stopMission,
        startSimulation,
        stopSimulation,
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
};

export const useHEGEMARuntime = () => useContext(RuntimeContext);
