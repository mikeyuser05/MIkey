import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { useClickOutside } from '@hooks/useClickOutside';

export type DropdownAlign = 'left' | 'right';

export interface DropdownProps {
  trigger: (props: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: DropdownAlign;
  panelClassName?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'right',
  panelClassName,
}: DropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = (): void => setIsOpen(false);
  const toggle = (): void => setIsOpen((prev) => !prev);

  useClickOutside(containerRef, close, isOpen);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {trigger({ isOpen, toggle })}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-40 mt-2 min-w-[14rem] overflow-hidden rounded-2xl border border-border-light bg-surface-light shadow-elevated dark:border-border-dark dark:bg-surface-dark',
              align === 'right' ? 'right-0' : 'left-0',
              panelClassName,
            )}
          >
            {children({ close })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface DropdownItemProps {
  icon?: ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: DropdownItemProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        danger
          ? 'text-status-danger hover:bg-status-danger/10'
          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
      )}
    >
      {icon && <span className="inline-flex h-4 w-4 shrink-0 items-center">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

export function DropdownSeparator(): ReactElement {
  return <div className="my-1 h-px bg-border-light dark:bg-border-dark" />;
}
