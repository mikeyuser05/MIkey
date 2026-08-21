import type { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  UserCircle,
  Search,
  ChevronRight,
  LogOut,
  Settings,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  Palette,
} from 'lucide-react';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { useTheme } from '@hooks/useTheme';
import { IconButton } from '@components/ui/IconButton';
import { Dropdown, DropdownItem, DropdownSeparator } from '@components/ui/Dropdown';
import { Badge } from '@components/ui/Badge';
import { buildBreadcrumbs } from '@utils/breadcrumbs';
import { logout } from '@services/firebase/authService';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  severity: 'info' | 'success' | 'warning';
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Device reconnected to mesh', time: '2m ago', severity: 'success' },
  { id: 'n2', title: 'Ambient gas reading elevated', time: '18m ago', severity: 'warning' },
  { id: 'n3', title: 'Firmware check completed', time: '1h ago', severity: 'info' },
];

const NOTIFICATION_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
} as const;

export function Navbar(): ReactElement {
  const { setMobileSidebarOpen = () => {} } = useGlobalContext() as any;
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [activePalette, setActivePalette] = useState('Cyber Dark');
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  const applyPaletteToDOM = (palette: string) => {
    const root = document.documentElement;
    if (palette === 'Tactical Red') {
      root.setAttribute('data-theme', 'tactical');
    } else if (palette === 'Clinical Emerald') {
      root.setAttribute('data-theme', 'emerald');
    } else {
      root.setAttribute('data-theme', 'cyber');
    }
  };

  const handleSelectPalette = (themeName: string) => {
    setActivePalette(themeName);
    applyPaletteToDOM(themeName);
    toast.success(`Theme Applied: ${themeName}`);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate(ROUTES.LOGIN, { replace: true });
    } catch {
      toast.error('Unable to sign out. Please try again.');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 flex-col justify-center gap-1 border-b border-border-light bg-surface-light/80 px-4 backdrop-blur dark:border-border-dark dark:bg-surface-dark/80 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="focus-ring shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 sm:flex">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={crumb.path} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                  {isLast ? (
                    <Link to="/dashboard" className="flex items-center gap-2 focus-ring rounded truncate">
                      <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-slate-700 dark:hover:text-slate-200">
                        {crumb.label}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="focus-ring truncate rounded text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>

          <div className="relative ml-2 hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search vitals, devices, events…"
              className="focus-ring w-full rounded-xl border border-border-light bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-border-dark dark:bg-slate-900/60 dark:text-slate-200"
              aria-label="Search dashboard"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* PR35 Palette Selector Dropdown */}
          <Dropdown
            align="right"
            trigger={({ toggle, isOpen }) => (
              <IconButton
                icon={<Palette className="h-5 w-5 text-sky-400" />}
                aria-label="Theme Palette Menu"
                active={isOpen}
                onClick={toggle}
              />
            )}
          >
            {({ close }) => (
              <div className="py-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  PR35 Theme Switcher
                </div>
                <DropdownSeparator />
                {[
                  { name: 'Cyber Dark', desc: 'Default Cyan' },
                  { name: 'Tactical Red', desc: 'Emergency High-Contrast' },
                  { name: 'Clinical Emerald', desc: 'Medical Monitoring' },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleSelectPalette(item.name);
                      close();
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-slate-800 transition-colors flex flex-col ${
                      activePalette === item.name ? 'border-l-2 border-sky-400 bg-slate-850' : ''
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </Dropdown>

          <IconButton
            icon={
              resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
            }
            aria-label="Toggle theme"
            onClick={toggleTheme}
          />

          {/* User Account Dropdown */}
          <Dropdown
            align="right"
            trigger={({ toggle, isOpen }) => (
              <button
                type="button"
                onClick={toggle}
                className={cn(
                  'focus-ring flex items-center gap-2 rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  isOpen && 'bg-slate-100 dark:bg-slate-800',
                )}
                aria-label="Account menu"
              >
                <UserCircle className="h-6 w-6" />
                <span className="hidden text-sm font-medium sm:block">Guest</span>
              </button>
            )}
          >
            {({ close }) => (
              <div className="py-1.5">
                <DropdownItem
                  icon={<User className="h-4 w-4" />}
                  label="Profile"
                  onClick={() => close()}
                />
                <DropdownItem
                  icon={<Settings className="h-4 w-4" />}
                  label="Preferences"
                  onClick={() => {
                    close();
                    navigate('/settings');
                  }}
                />
                <DropdownSeparator />
                <DropdownItem
                  icon={<LogOut className="h-4 w-4" />}
                  label="Sign out"
                  danger
                  onClick={() => {
                    close();
                    void handleLogout();
                  }}
                />
              </div>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
