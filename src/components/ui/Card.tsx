import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@utils/cn';

export type CardVariant = 'default' | 'elevated' | 'outline' | 'ghost';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  default:
    'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark',
  elevated:
    'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-elevated',
  outline: 'bg-transparent border border-border-light dark:border-border-dark',
  ghost: 'bg-slate-50 dark:bg-slate-900/40 border border-transparent',
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-all duration-200',
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        interactive && 'focus-ring cursor-pointer hover:-translate-y-0.5 hover:shadow-elevated',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
