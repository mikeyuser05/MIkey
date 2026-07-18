import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CompassIcon, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Container } from '@components/ui/Container';
import { ROUTES } from '@constants/routes.constants';

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background-light px-6 dark:bg-background-dark">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600/10 text-primary-600 dark:text-primary-400"
          >
            <CompassIcon className="h-8 w-8" strokeWidth={2} />
          </motion.div>

          <div className="space-y-1">
            <p className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              404
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Page not found
            </h1>
            <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
              The page you&apos;re looking for doesn&apos;t exist or may have been moved.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate(-1)}
            >
              Go back
            </Button>
            <Button
              variant="primary"
              leftIcon={<Home className="h-4 w-4" />}
              onClick={() => navigate(ROUTES.DASHBOARD)}
            >
              Back to dashboard
            </Button>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
