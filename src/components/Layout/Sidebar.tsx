import { ReactElement } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Siren,
  Radio,
  WifiOff,
  FileText,
  Cpu,
  BarChart3,
  Bell,
  Settings,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps): ReactElement {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Triage Hub', path: '/triage', icon: Siren },
    { label: 'Command Center', path: '/command', icon: Radio },
    { label: 'Offline Sync', path: '/offline-monitor', icon: WifiOff },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Devices', path: '/devices', icon: Cpu },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Alerts', path: '/alerts', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop (Only active on small screens when opened) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                H
              </div>
              <div>
                <h2 className="font-bold text-white text-sm tracking-wide">HPO V2</h2>
                <p className="text-[10px] text-slate-400 font-medium">Health Monitoring</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Version Footer */}
          <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center shrink-0">
            LGN.8 PR34 MOBILE READY
          </div>
        </div>
      </aside>
    </>
  );
}