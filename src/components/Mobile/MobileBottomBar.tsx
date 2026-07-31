import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Siren, Radio, WifiOff, Settings2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dash', path: '/', icon: LayoutDashboard },
  { id: 'triage', label: 'Triage', path: '/triage', icon: Siren },
  { id: 'command', label: 'Command', path: '/command', icon: Radio },
  { id: 'offline', label: 'Sync', path: '/offline', icon: WifiOff },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings2 },
];

export const MobileBottomBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-800 bg-slate-950/95 p-2 backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
