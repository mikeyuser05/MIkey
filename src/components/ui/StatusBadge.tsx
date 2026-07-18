import type { ReactElement } from 'react';
import { cn } from '@utils/cn';

export type StatusKind = 'online' | 'offline' | 'syncing' | 'warning' | 'error' | 'idle';

export interface StatusBadgeProps {
  status: StatusKind;
  label?: string;
  pulse?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StatusKind, { dot: string; text: string; defaultLabel: string }> = {
  online: {
    dot: 'bg-status-success',
    text: 'text-emerald-700 dark:text-emerald-400',
    defaultLabel: 'Online',
  },
  offline: {
    dot: 'bg-slate-400',
    text: 'text-slate-500 dark:text-slate-400',
    defaultLabel: 'Offline',
  },
  syncing: {
    dot: 'bg-primary-500',
    text: 'text-primary-700 dark:text-primary-400',
    defaultLabel: 'Syncing',
  },
  warning: {
    dot: 'bg-status-warning',
    text: 'text-amber-700 dark:text-amber-400',
    defaultLabel: 'Warning',
  },
  error: {
    dot: 'bg-status-danger',
    text: 'text-red-700 dark:text-red-400',
    defaultLabel: 'Error',
  },
  idle: {
    dot: 'bg-slate-300 dark:bg-slate-600',
    text: 'text-slate-500 dark:text-slate-400',
    defaultLabel: 'Idle',
  },
};

export function StatusBadge({
  status,
  label,
  pulse = false,
  className,
}: StatusBadgeProps): ReactElement {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-slate-800',
        config.text,
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              config.dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.dot)} />
      </span>
      {label ?? config.defaultLabel}
    </span>
  );
}
