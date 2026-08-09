import type { ReactElement } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Siren, 
  Radio, 
  WifiOff, 
  FileText, 
  Cpu, 
  TrendingUp, 
  Bell, 
  Sliders, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { MAIN_NAV_ITEMS, MODULE_NAV_ITEMS, type NavItem } from '@constants/routes.constants';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { cn } from '@utils/cn';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Siren,
  Radio,
  WifiOff,
  FileText,
  Cpu,
  TrendingUp,
  Bell,
  Sliders,
};

export function Sidebar(): ReactElement {
  const { isSidebarCollapsed, toggleSidebar } = useGlobalContext() as any;
  const location = useLocation();

  const renderNavItem = (item: NavItem) => {
    const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-600/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
        )}
      >
        <IconComponent className="h-5 w-5 shrink-0" />
        {!isSidebarCollapsed && <span>{item.label}</span>}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 z-40 h-screen flex-col border-r border-slate-800 bg-slate-950 transition-all duration-200',
        isSidebarCollapsed ? 'w-20' : 'w-[280px]'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              H
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">HPO V2</h1>
              <p className="text-[10px] text-slate-400">Health Monitoring</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        <div>
          {!isSidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Main
            </p>
          )}
          <nav className="space-y-1">{MAIN_NAV_ITEMS.map(renderNavItem)}</nav>
        </div>

        <div>
          {!isSidebarCollapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Intelligence & Modules
            </p>
          )}
          <nav className="space-y-1">{MODULE_NAV_ITEMS.map(renderNavItem)}</nav>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
