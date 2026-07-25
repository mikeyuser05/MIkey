import type { ReactElement } from 'react';
import {
  Cpu,
  HeartPulse,
  Droplets,
  Footprints,
  Wind,
  Wifi,
} from 'lucide-react';

import { Card } from '@components/ui/Card';
import { SectionHeader } from '@components/ui/SectionHeader';
import { StatusBadge } from '@components/ui/StatusBadge';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function DeviceStatusPanel(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const formatPacketTime = (rawPacket: any) => {
    if (!rawPacket || rawPacket === 0) return 'Just now';
    if (typeof rawPacket === 'number' && rawPacket > 1000000000) {
      return new Date(rawPacket).toLocaleTimeString();
    }
    return 'Online';
  };

  const rows = [
    {
      id: 'connection',
      icon: Wifi,
      label: 'Connection',
      value: telemetryConnected ? 'Connected' : 'Disconnected',
      status: telemetryConnected ? 'online' : 'offline',
    },
    {
      id: 'heart',
      icon: HeartPulse,
      label: 'Heart Rate',
      value: `${telemetry?.heartRate ?? 0} bpm`,
      status: (telemetry?.heartRate ?? 0) > 0 ? 'online' : 'idle',
    },
    {
      id: 'spo2',
      icon: Droplets,
      label: 'SpO₂',
      value: `${telemetry?.spo2 ?? 0}%`,
      status: (telemetry?.spo2 ?? 0) > 0 ? 'online' : 'idle',
    },
    {
      id: 'steps',
      icon: Footprints,
      label: 'Steps',
      value: `${telemetry?.steps ?? 0}`,
      status: 'online',
    },
    {
      id: 'gas',
      icon: Wind,
      label: 'Gas',
      value: `${telemetry?.gas ?? 0} PPM`,
      status: (telemetry?.gas ?? 0) > 1800 ? 'warning' : 'online',
    },
    {
      id: 'packet',
      icon: Cpu,
      label: 'Last Packet',
      value: formatPacketTime(telemetry?.lastPacket),
      status: 'online',
    },
  ] as const;

  return (
    <Card
      padding="md"
      className="flex h-full flex-col gap-5"
    >
      <SectionHeader
        title="Device Status"
        subtitle="Live telemetry from ESP32"
        icon={<Cpu className="h-4 w-4" />}
      />

      <ul className="flex flex-col divide-y divide-border-light dark:divide-border-dark">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Icon className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {row.label}
                  </p>

                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {row.value}
                  </p>
                </div>
              </div>

              <StatusBadge
                status={row.status}
                pulse={row.status === 'online'}
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}