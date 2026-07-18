import { useEffect, type ReactElement, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@utils/cn';
import { IconButton } from './IconButton';

export type DrawerPosition = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: DrawerPosition;
  title?: string;
  children: ReactNode;
  widthClassName?: string;
}

const POSITION_CLASSES: Record<DrawerPosition, string> = {
  left: 'inset-y-0 left-0 h-full',
  right: 'inset-y-0 right-0 h-full',
  bottom: 'inset-x-0 bottom-0 w-full rounded-t-2xl',
};

function getSlideOffset(position: DrawerPosition): { x?: string; y?: string } {
  switch (position) {
    case 'left':
      return { x: '-100%' };
    case 'right':
      return { x: '100%' };
    case 'bottom':
      return { y: '100%' };
  }
}

export function Drawer({
  isOpen,
  onClose,
  position = 'right',
  title,
  children,
  widthClassName = 'w-full max-w-sm',
}: DrawerProps): ReactElement | null {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  const offset = getSlideOffset(position);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ x: offset.x ?? 0, y: offset.y ?? 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: offset.x ?? 0, y: offset.y ?? 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn(
              'absolute flex flex-col border-border-light bg-surface-light shadow-elevated dark:border-border-dark dark:bg-surface-dark',
              POSITION_CLASSES[position],
              position !== 'bottom' && widthClassName,
              position === 'left' && 'border-r',
              position === 'right' && 'border-l',
              position === 'bottom' && 'max-h-[85vh] border-t',
            )}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-border-light px-5 py-4 dark:border-border-dark">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {title}
                </h2>
                <IconButton
                  icon={<X className="h-4 w-4" />}
                  aria-label="Close panel"
                  size="sm"
                  onClick={onClose}
                />
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
