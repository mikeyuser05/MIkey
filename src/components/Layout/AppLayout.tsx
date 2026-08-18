import { useState, type ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function AppLayout(): ReactElement {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    /* h-screen & w-screen locks the viewport cleanly */
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* 1. Sidebar (Desktop par left sticky, Mobile par overlay drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Wrapper (Occupies remaining width automatically without manual margins) */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950">
          <AnimatePresence mode="wait" initial={false}>
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

export default AppLayout;