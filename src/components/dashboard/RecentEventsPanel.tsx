import type { ReactElement } from 'react';
import { Activity } from 'lucide-react';

import { Card } from '@components/ui/Card';
import { SectionHeader } from '@components/ui/SectionHeader';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function RecentEventsPanel(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const events = [
    {
      id: 'connection',
      title: telemetryConnected ? 'ESP32 Connected' : 'ESP32 Disconnected',
      subtitle: telemetryConnected
        ? 'Realtime Database connection active'
        : 'Waiting for device...',
      status: telemetryConnected ? 'online' : 'offline',
    },
    {
      id: 'heart',
      title: 'Heart Rate Updated',
      subtitle: `${telemetry?.heartRate ?? 0} bpm`,
      status:
        (telemetry?.heartRate ?? 0) > 0
          ? 'online'
          : 'idle',
    },
    {
      id: 'spo2',
      title: 'SpO₂ Updated',
      subtitle: `${telemetry?.spo2 ?? 0}%`,
      status:
        (telemetry?.spo2 ?? 0) > 0
          ? 'online'
          : 'idle',
    },
    {
      id: 'steps',
      title: 'Steps Updated',
      subtitle: `${telemetry?.steps ?? 0} steps`,
      status:
        (telemetry?.steps ?? 0) > 0
          ? 'online'
          : 'idle',
    },
    {
      id: 'gas',
      title: 'Gas Sensor Updated',
      subtitle: `${telemetry?.gas ?? 0}`,
      status:
        (telemetry?.gas ?? 0) > 1800
          ? 'warning'
          : 'online',
    },
    {
      id: 'alarm',
      title:
        telemetry?.alarm
          ? 'Alarm Triggered'
          : 'No Active Alarm',
      subtitle:
        telemetry?.alarm
          ? 'Threshold exceeded'
          : 'System operating normally',
      status:
        telemetry?.alarm
          ? 'error'
          : 'online',
    },
  ] as const;

  return (
    <Card
      padding="md"
      className="flex h-full flex-col gap-5"
    >
      <SectionHeader
        title="Recent Events"
        subtitle="Latest telemetry updates"
        icon={<Activity className="h-4 w-4" />}
      />

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-lg border border-border-light p-3 dark:border-border-dark"
          >
            <div>
              <p className="text-sm font-medium">
                {event.title}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {event.subtitle}
              </p>
            </div>

            <StatusBadge
              status={event.status}
              pulse={event.status === 'online'}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}