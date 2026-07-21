import type { ReactElement } from 'react';
import { Cpu, Wifi, HardDrive } from 'lucide-react';

export function DevicesPage(): ReactElement {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Devices & Sensors</h1>
          <p className="text-sm text-slate-500">PR1 & PR2 ESP32 Hardware Status & Direct Telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Wearable Node</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500">ESP-NOW Active</span>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="h-8 w-8 text-primary-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">ESP32 Main (PR1)</p>
              <p className="text-xs text-slate-400">BMI270 • MAX30100 Sensors</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Receiver Gateway</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500">Firebase Live</span>
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Receiver Node (PR2)</p>
              <p className="text-xs text-slate-400">MQ-9 Gas Monitor • Wi-Fi Stream</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DevicesPage;