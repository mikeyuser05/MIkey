export const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  NOT_FOUND: '*',
} as const;

export type AppRoutePath = (typeof ROUTES)[keyof typeof ROUTES];

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: 'LayoutDashboard' },
];
