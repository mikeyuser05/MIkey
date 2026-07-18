import type { ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@utils/cn';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppLayout(): ReactElement {
  const { isSidebarCollapsed } = useGlobalContext();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Sidebar />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[margin] duration-200 ease-out',
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[280px]',
        )}
      >
        <Navbar />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
