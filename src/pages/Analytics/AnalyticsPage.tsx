import type { ReactElement } from 'react';
import { LineChart, Activity, Heart, Wind } from 'lucide-react';

export function AnalyticsPage(): ReactElement {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics & Intelligence</h1>
        <p className="text-sm text-slate-500">Biometric Stream Processing & Trend Analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Heart Rate & SpO2 Analytics</h3>
          </div>
          <div className="h-48 flex items-center justify-center border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
            Live Intelligence Stream Buffer Connected
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Wind className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Gas Exposure Analytics</h3>
          </div>
          <div className="h-48 flex items-center justify-center border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
            MQ-9 Environmental Sensor Telemetry Active
          </div>
        </div>
      </div>
    </div>
  );
}
export default AnalyticsPage;