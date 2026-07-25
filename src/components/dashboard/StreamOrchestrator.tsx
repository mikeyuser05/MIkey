import React from 'react';
import { useGlobalContext } from '../../hooks/useGlobalContext';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

export const StreamOrchestrator: React.FC = () => {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry;
  const devices = telemetry?.devices ? Object.values(telemetry.devices) : [];

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">LGN.8 Multi-Node Pipeline Stream</h2>
            <p className="text-xs text-slate-400">Live multi-device telemetry synchronization (PR5 – PR10 Active)</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          LGN.8 ACTIVE
        </span>
      </div>

      {/* PR5 - PR10 Active Nodes Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
        {devices.map((device: any) => (
          <div key={device.deviceId} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">{device.deviceId}</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};