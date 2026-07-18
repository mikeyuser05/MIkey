import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';

export type BadgeVariant =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  primary: 'bg-primary-600/10 text-primary-700 dark:text-primary-400',
  success: 'bg-status-success/10 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-status-warning/10 text-amber-700 dark:text-amber-400',
  danger: 'bg-status-danger/10 text-red-700 dark:text-red-400',
  info: 'bg-status-info/10 text-blue-700 dark:text-blue-400',
  neutral: 'bg-slate-200/70 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'h-5 px-2 text-[11px] gap-1',
  md: 'h-6 px-2.5 text-xs gap-1.5',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  icon,
  className,
  children,
  ...rest
}: BadgeProps): ReactNode {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      {children}
    </span>
  );
}
