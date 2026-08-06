export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  DEVICES: '/devices',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  ALERTS: '/alerts',
  SETTINGS: '/settings',
  TRIAGE: '/triage',
  HARDWARE_LAB: '/hardware-lab',
  COMMAND_CENTER: '/command-center',
  OFFLINE_MONITOR: '/offline-monitor',
  NOT_FOUND: '*',
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  label: string;
  path: string;
  iconName: string;
}

// 1. MAIN Section Navigation Items
export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, iconName: 'LayoutDashboard' },
];

// 2. INTELLIGENCE & MODULES Section Navigation Items
export const MODULE_NAV_ITEMS: NavItem[] = [
  { label: 'Triage Hub', path: ROUTES.TRIAGE, iconName: 'Siren' },
  { label: 'Command Center', path: ROUTES.COMMAND_CENTER, iconName: 'Radio' },
  { label: 'Offline Sync', path: ROUTES.OFFLINE_MONITOR, iconName: 'WifiOff' },
  { label: 'Reports', path: ROUTES.REPORTS, iconName: 'FileText' },
  { label: 'Devices', path: ROUTES.DEVICES, iconName: 'Cpu' },
  { label: 'Analytics', path: ROUTES.ANALYTICS, iconName: 'TrendingUp' },
  { label: 'Alerts', path: ROUTES.ALERTS, iconName: 'Bell' },
  { label: 'Settings', path: ROUTES.SETTINGS, iconName: 'Sliders' },
];