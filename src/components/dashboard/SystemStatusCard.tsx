import type { ReactElement } from 'react';
import {
  ShieldCheck,
  Wifi,
  HeartPulse,
  Wind,
  BellRing,
  Database,
} from 'lucide-react';

import { Card } from '@components/ui/Card';
import { SectionHeader } from '@components/ui/SectionHeader';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function SystemStatusCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const gasWarning = (telemetry?.gas ?? 0) > 1800;

  const rows = [
    {
      id: 'firebase',
      icon: Database,
      label: 'Firebase RTDB',
      value: telemetryConnected ? 'Connected' : 'Disconnected',
      status: telemetryConnected ? 'online' : 'offline',
    },
    {
      id: 'heart',
      icon: HeartPulse,
      label: 'Heart Sensor',
      value:
        (telemetry?.heartRate ?? 0) > 0
          ? 'Receiving Data'
          : 'Waiting',
      status:
        (telemetry?.heartRate ?? 0) > 0
          ? 'online'
          : 'idle',
    },
    {
      id: 'gas',
      icon: Wind,
      label: 'Gas Sensor',
      value: gasWarning ? 'Warning' : 'Normal',
      status: gasWarning ? 'warning' : 'online',
    },
    {
      id: 'alarm',
      icon: BellRing,
      label: 'Alarm',
      value: telemetry?.alarm ? 'ACTIVE' : 'Inactive',
      status: telemetry?.alarm ? 'error' : 'online',
    },
    {
      id: 'network',
      icon: Wifi,
      label: 'Network',
      value: telemetryConnected ? 'Healthy' : 'Offline',
      status: telemetryConnected ? 'online' : 'offline',
    },
    {
      id: 'system',
      icon: ShieldCheck,
      label: 'Overall Health',
      value:
        telemetryConnected && !gasWarning
          ? 'Healthy'
          : 'Attention Required',
      status:
        telemetryConnected && !gasWarning
          ? 'online'
          : 'warning',
    },
  ] as const;

  return (
    <Card padding="md" className="flex flex-col gap-5">
      <SectionHeader
        title="System Status"
        subtitle="Realtime health summary"
        icon={<ShieldCheck className="h-5 w-5" />}
      />

      <div className="space-y-3">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={row.id}
              className="flex items-center justify-between rounded-lg border border-border-light p-3 dark:border-border-dark"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {row.label}
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.value}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={row.status}
                pulse={row.status === 'online'}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}