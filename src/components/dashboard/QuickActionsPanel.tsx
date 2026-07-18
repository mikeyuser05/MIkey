import type { ReactElement } from 'react';
import toast from 'react-hot-toast';
import { Download, RefreshCw, FileBarChart2, Settings2, Zap } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { SectionHeader } from '@components/ui/SectionHeader';
import type { QuickAction } from '@app-types/dashboard.types';

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'export',
    label: 'Export Data',
    description: 'Download vitals as CSV',
    icon: <Download className="h-5 w-5" strokeWidth={2.25} />,
  },
  {
    id: 'refresh',
    label: 'Refresh',
    description: 'Re-sync device telemetry',
    icon: <RefreshCw className="h-5 w-5" strokeWidth={2.25} />,
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'View weekly summaries',
    icon: <FileBarChart2 className="h-5 w-5" strokeWidth={2.25} />,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Configure thresholds',
    icon: <Settings2 className="h-5 w-5" strokeWidth={2.25} />,
  },
];

export function QuickActionsPanel(): ReactElement {
  const handleAction = (action: QuickAction): void => {
    toast(`${action.label} isn't wired up yet — coming in a future PR.`, {
      icon: '🚧',
    });
  };

  return (
    <Card padding="md" className="flex h-full flex-col gap-5">
      <SectionHeader
        title="Quick Actions"
        subtitle="Common tasks, one tap away"
        icon={<Zap className="h-4 w-4" strokeWidth={2.25} />}
      />

      <div className="grid grid-cols-2 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAction(action)}
            className="focus-ring group flex flex-col items-start gap-2.5 rounded-xl border border-border-light p-3.5 text-left transition-colors hover:border-primary-300 hover:bg-primary-600/5 dark:border-border-dark dark:hover:border-primary-700"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary-600/10 group-hover:text-primary-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:text-primary-400">
              {action.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {action.label}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
