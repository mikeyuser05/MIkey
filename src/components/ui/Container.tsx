import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@utils/cn';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  children: ReactNode;
}

const SIZE_CLASSES: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[100rem]',
  full: 'max-w-none',
};

export function Container({ size = 'lg', className, children, ...rest }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-1', SIZE_CLASSES[size], className)} {...rest}>
      {children}
    </div>
  );
}
