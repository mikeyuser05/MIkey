import type { ReactElement, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@components/ui/Card';
import { Badge } from '@components/ui/Badge';
import { cn } from '@utils/cn';

export type VitalStatus = 'normal' | 'warning' | 'critical' | 'offline';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface VitalCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  status: VitalStatus;
  trend?: string | { direction: TrendDirection; changeLabel: string };
  helperText?: string;
  accentColorClass: string;
  accentBgClass: string;
}

const STATUS_BADGE_VARIANT: Record<VitalStatus, string> = {
  normal: 'success',
  warning: 'warning',
  critical: 'danger',
  offline: 'secondary', 
};

const STATUS_LABEL: Record<VitalStatus, string> = {
  normal: 'Normal',
  warning: 'Elevated',
  critical: 'Critical',
  offline: 'Offline',
};

const TREND_ICON: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

export function VitalCard({
  icon,
  label,
  value,
  unit,
  status,
  trend,
  helperText,
  accentColorClass,
  accentBgClass,
}: VitalCardProps): ReactElement {
  
  const hasTrendObject = typeof trend === 'object' && trend !== null;
  const trendDirection = hasTrendObject ? trend.direction : null;
  const trendLabel = hasTrendObject ? trend.changeLabel : typeof trend === 'string' ? trend : null;
  const TrendIcon = trendDirection ? TREND_ICON[trendDirection] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card padding="md" interactive className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accentBgClass)}
          >
            <span className={accentColorClass}>{icon}</span>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[status] as any}>{STATUS_LABEL[status]}</Badge>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{unit}</span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border-light pt-3 text-xs dark:border-border-dark">
          {trendDirection && TrendIcon && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-medium',
                trendDirection === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trendDirection === 'down'
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400',
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              {trendLabel}
            </span>
          )}

          {!trendDirection && trendLabel && (
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {trendLabel}
            </span>
          )}

          {helperText && !trend && (
            <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
          )}
        </div>
      </Card>
    </motion.div>
  );
}