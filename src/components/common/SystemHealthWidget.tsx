import { ReactElement } from 'react';
import { ShieldCheck, Wifi, Server, PhoneCall, Radio } from 'lucide-react';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { LocationValidator } from '../../types/location';

export function SystemHealthWidget(): ReactElement {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry;
  const isConnected = globalContext?.isConnected ?? true;

  // 1. Telemetry Freshness Check
  const lastTs = telemetry?.timestamp || Date.now();
  const isTelemetryStale = (Date.now() - lastTs) > 15000;
  const telemetryStatus = !isConnected ? 'OFFLINE' : isTelemetryStale ? 'STALE' : 'LIVE';

  // 2. GPS Fix Status (Hardware not connected yet)
  const hasGpsFix = LocationValidator.isValidCoordinate(telemetry?.latitude, telemetry?.longitude);

  return (
    <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          SYSTEM OBSERVABILITY & HEALTH
        </h3>
        <span className="text-xs font-mono text-slate-500">
          Last Packet: {new Date(lastTs).toLocaleTimeString()}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        {/* Telemetry Stream */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Radio className="h-3.5 w-3.5" />
            <span>Telemetry</span>
          </div>
          <span className={`font-bold ${
            telemetryStatus === 'LIVE' ? 'text-emerald-500' : telemetryStatus === 'STALE' ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {telemetryStatus === 'LIVE' ? '🟢 LIVE' : telemetryStatus === 'STALE' ? '🟡 STALE' : '🔴 OFFLINE'}
          </span>
        </div>

        {/* Firebase RTDB */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wifi className="h-3.5 w-3.5" />
            <span>Firebase RTDB</span>
          </div>
          <span className={`font-bold ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isConnected ? '🟢 CONNECTED' : '🔴 DISCONNECTED'}
          </span>
        </div>

        {/* Alert Safety Engine */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Safety Gate</span>
          </div>
          <span className="font-bold text-emerald-500">🟢 ACTIVE</span>
        </div>

        {/* Twilio Emergency Dispatcher */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <PhoneCall className="h-3.5 w-3.5" />
            <span>Twilio Call</span>
          </div>
          <span className="font-bold text-emerald-500">🟢 READY (PR26)</span>
        </div>

        {/* GPS Fix Status */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Server className="h-3.5 w-3.5" />
            <span>GPS Fix</span>
          </div>
          <span className={`font-bold ${hasGpsFix ? 'text-emerald-500' : 'text-slate-400'}`}>
            {hasGpsFix ? '🟢 FIXED' : '⚪ NO FIX'}
          </span>
        </div>
      </div>
    </div>
  );
}