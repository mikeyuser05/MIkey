import type { ReactElement, ReactNode } from 'react';
import { cn } from '@utils/cn';

export interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps): ReactElement {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
