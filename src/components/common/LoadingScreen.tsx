import type { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { APP_NAME } from '@constants/app.constants';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = 'Loading dashboard…',
}: LoadingScreenProps): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-light dark:bg-background-dark"
    >
      <motion.div
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/10 text-primary-600 dark:text-primary-400"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary-500/40" />
        <HeartPulse className="relative h-8 w-8" strokeWidth={2} />
      </motion.div>

      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
          {APP_NAME}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>
      </div>

      <span className="sr-only">{message}</span>
    </div>
  );
}
