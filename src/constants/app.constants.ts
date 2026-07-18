export const APP_NAME = 'NOEXCUSE HPO V2';
export const APP_SHORT_NAME = 'HPO V2';
export const APP_DESCRIPTION = 'Real-time wearable health monitoring dashboard';
export const APP_VERSION = '0.1.0';

export const STORAGE_KEYS = {
  THEME_MODE: 'noexcuse_hpo_theme_mode',
  SIDEBAR_COLLAPSED: 'noexcuse_hpo_sidebar_collapsed',
  AUTH_TOKEN: 'noexcuse_hpo_auth_token',
} as const;

export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const LAYOUT = {
  sidebarWidth: 280,
  sidebarCollapsedWidth: 80,
  navbarHeight: 64,
} as const;

export const TOAST_CONFIG = {
  duration: 4000,
  position: 'top-right',
} as const;

export const DEFAULT_ERROR_MESSAGE =
  'Something went wrong. Please try again or contact support if the problem persists.';
