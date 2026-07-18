import type { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ChevronLeft,
  X,
  LayoutDashboard,
  Cpu,
  LineChart,
  BellRing,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@utils/cn';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { Tooltip } from '@components/ui/Tooltip';
import { Badge } from '@components/ui/Badge';
import { APP_SHORT_NAME } from '@constants/app.constants';
import { PRIMARY_NAV_ITEMS } from '@constants/routes.constants';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
};

interface UpcomingNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const UPCOMING_NAV_ITEMS: UpcomingNavItem[] = [
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'alerts', label: 'Alerts', icon: BellRing },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function Sidebar(): ReactElement {
  const { isSidebarCollapsed, toggleSidebar, isMobileSidebarOpen, setMobileSidebarOpen } =
    useGlobalContext();

  return (
    <>
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border-light bg-surface-light dark:border-border-dark dark:bg-surface-dark',
          'transition-transform duration-200 ease-out lg:translate-x-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-card">
              <Activity className="h-5 w-5" strokeWidth={2.25} />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
                  {APP_SHORT_NAME}
                </p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                  Health Monitoring
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="focus-ring rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Main
              </p>
            )}
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

              const link = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-600/10 text-primary-700 dark:text-primary-400'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary-600"
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        />
                      )}
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );

              return isSidebarCollapsed ? (
                <Tooltip key={item.path} content={item.label} position="right">
                  {link}
                </Tooltip>
              ) : (
                link
              );
            })}
          </div>

          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Coming Soon
              </p>
            )}
            {UPCOMING_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const row = (
                <div
                  key={item.id}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 dark:text-slate-600"
                  aria-disabled="true"
                >
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                  {!isSidebarCollapsed && (
                    <span className="flex flex-1 items-center justify-between gap-2 truncate">
                      {item.label}
                      <Badge variant="neutral" size="sm">
                        Soon
                      </Badge>
                    </span>
                  )}
                </div>
              );

              return isSidebarCollapsed ? (
                <Tooltip key={item.id} content={`${item.label} (Coming soon)`} position="right">
                  {row}
                </Tooltip>
              ) : (
                row
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border-light p-3 dark:border-border-dark">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-2',
              isSidebarCollapsed && 'justify-center',
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600/10 text-sm font-semibold text-primary-700 dark:text-primary-400">
              NX
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Guest User
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">Not signed in</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            className="focus-ring mt-2 hidden w-full items-center justify-center gap-2 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:flex"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', isSidebarCollapsed && 'rotate-180')}
            />
            {!isSidebarCollapsed && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
