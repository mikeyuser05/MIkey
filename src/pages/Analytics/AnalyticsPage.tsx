import type { ReactElement } from 'react';
import { LineChart, Heart, Wind, Activity, Zap } from 'lucide-react';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function AnalyticsPage(): ReactElement {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry || { heartRate: 0, spO2: 0, gas: 0, steps: 0 };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Biometric Stream Analytics</h1>
          <p className="text-sm text-slate-500">LGN.7 PR4 Intelligence Pipeline • Live Telemetry Processing</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
          <Zap className="h-4 w-4 animate-pulse" />
          Engine Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Heart Rate Stream</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{telemetry.heartRate || '--'} <span className="text-sm font-normal text-slate-500">bpm</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">SpO2 Oxygen Saturation</span>
            <Activity className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{telemetry.spO2 || '--'} <span className="text-sm font-normal text-slate-500">%</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">MQ-9 Air Quality</span>
            <Wind className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{telemetry.gas || '--'} <span className="text-sm font-normal text-slate-500">PPM</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary-500" />
            Vitals Intelligence Stream
          </h3>
          
          {/* UPDATED: Aapka naya Vitals Stream Box yahan replace ho gaya hai */}
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40 p-4">
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Real-time Biometric Buffering Active</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">MAX30100 PPG Signal synced with Firebase RTDB</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wind className="h-5 w-5 text-amber-500" />
            Environmental Hazard Stream
          </h3>
          <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40 p-4">
            <p className="text-slate-400 text-sm">MQ-9 Telemetry Channel Active</p>
            <p className="text-xs text-slate-600 mt-1">PR2 Receiver Node live threshold evaluation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsPage;
