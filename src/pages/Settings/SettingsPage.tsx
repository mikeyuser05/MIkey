import type { ReactElement } from 'react';
import { Settings2, Database, Key } from 'lucide-react';

export function SettingsPage(): ReactElement {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500">Firebase RTDB & Threshold Rules Configuration</p>
      </div>

      <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <Database className="h-5 w-5 text-primary-500" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Firebase Realtime Database</p>
            <p className="text-xs text-slate-400">Status: Connected to Telemetry Node</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SettingsPage;