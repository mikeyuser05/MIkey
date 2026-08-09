import { useState, type ReactElement } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Siren, Radio, WifiOff, FileText, Cpu, 
  TrendingUp, Bell, Sliders, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { MAIN_NAV_ITEMS, MODULE_NAV_ITEMS, type NavItem } from '@constants/routes.constants';
import { cn } from '@utils/cn';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Siren, Radio, WifiOff, FileText, Cpu, TrendingUp, Bell, Sliders,
};

export function Sidebar(): ReactElement {
  // Local state to guarantee immediate collapse without context failure
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

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
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Middle Floating Toggle Arrow */}
      <button
        type="button"
        onClick={toggleSidebar}
        className={cn(
          "fixed top-1/2 -translate-y-1/2 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 shadow-2xl transition-all duration-300 hover:bg-slate-800 hover:text-white cursor-pointer",
          isCollapsed ? "left-3" : "left-[264px]"
        )}
        aria-label="Toggle Navigation Sidebar"
      >
        {isCollapsed ? (
          <ChevronRight className="h-5 w-5 text-blue-400" />
        ) : (
          <ChevronLeft className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {/* Main Collapsible Sliding Aside Drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-in-out',
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">H</div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">HPO V2</h1>
              <p className="text-[10px] text-slate-400">Health Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Main</p>
            <nav className="space-y-1">{MAIN_NAV_ITEMS.map(renderNavItem)}</nav>
          </div>
          <div>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Intelligence & Modules</p>
            <nav className="space-y-1">{MODULE_NAV_ITEMS.map(renderNavItem)}</nav>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Hide Sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}