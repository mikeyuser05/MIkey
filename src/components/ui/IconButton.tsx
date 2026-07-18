import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@utils/cn';
import type { ButtonVariant } from './Button';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: IconButtonSize;
  'aria-label': string;
  active?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'border border-border-light bg-transparent text-slate-600 hover:bg-slate-50 dark:border-border-dark dark:text-slate-300 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  danger: 'bg-status-danger text-white hover:bg-red-600',
};

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', size = 'md', active = false, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        'focus-ring relative inline-flex shrink-0 items-center justify-center rounded-xl transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        active && 'bg-primary-600/10 text-primary-700 dark:text-primary-400',
        className,
      )}
      {...rest}
    >
      {icon}
    </button>
  );
});
