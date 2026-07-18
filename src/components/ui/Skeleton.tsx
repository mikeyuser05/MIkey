import type { ReactElement } from 'react';
import { cn } from '@utils/cn';

export type SkeletonShape = 'text' | 'rect' | 'circle';

export interface SkeletonProps {
  shape?: SkeletonShape;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  shape = 'rect',
  width,
  height,
  className,
}: SkeletonProps): ReactElement {
  const shapeClass =
    shape === 'circle' ? 'rounded-full' : shape === 'text' ? 'rounded-md h-3' : 'rounded-xl';

  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn(
        'block animate-pulse bg-slate-200/80 dark:bg-slate-800/80',
        shapeClass,
        className,
      )}
      style={{
        width: width ?? (shape === 'circle' ? '2.5rem' : '100%'),
        height: height ?? (shape === 'circle' ? '2.5rem' : undefined),
      }}
    />
  );
}

export function SkeletonGroup({ rows = 3 }: { rows?: number }): ReactElement {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} shape="text" width={index === rows - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
