import type { ReactElement } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@utils/cn';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-9 w-9',
};

export function Spinner({ size = 'md', className, label }: SpinnerProps): ReactElement {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <Loader2
        className={cn(
          'animate-spin text-primary-600 dark:text-primary-400',
          SIZE_CLASSES[size],
          className,
        )}
        aria-hidden="true"
      />
      {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </span>
  );
}
