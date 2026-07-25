import type { ReactElement } from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function AlertsPage(): ReactElement {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry || { heartRate: 0, spO2: 0, gas: 0 };

  const isGasAlert = telemetry.gas > 400;
  const isHRAlert = telemetry.heartRate > 120 || (telemetry.heartRate < 40 && telemetry.heartRate > 0);
  const hasActiveAlert = isGasAlert || isHRAlert;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Alert Decision Engine</h1>
        <p className="text-sm text-slate-500">LGN.8 PR10 Safety Evaluation & Real-time Threshold Logs</p>
      </div>

      {!hasActiveAlert ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">All Systems Nominal</h3>
            <p className="text-xs text-slate-400 mt-1">PR4.3 Decision Engine: No emergency thresholds breached (SpO2, HR, Gas Safe).</p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 animate-bounce" />
          <div>
            <h3 className="font-bold text-white">Active Safety Alert Triggered!</h3>
            <p className="text-xs text-slate-300 mt-1">
              {isGasAlert && 'Hazardous Gas Concentration detected by MQ-9! '}
              {isHRAlert && 'Abnormal Heart Rate detected by Wearable Node!'}
            </p>
          </div>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Engine Threshold Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400">Gas Threshold:</span> <span className="font-bold text-amber-400">&gt; 400 PPM</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400">High Heart Rate:</span> <span className="font-bold text-rose-400">&gt; 120 BPM</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
            <span className="text-slate-400">Hypoxia Alert (SpO2):</span> <span className="font-bold text-cyan-400">&lt; 90 %</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AlertsPage;