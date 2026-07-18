import type { AppUser } from './user.types';

export type DeviceConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface WearableDevice {
  id: string;
  name: string;
  model: string;
  firmwareVersion: string;
  batteryLevel: number;
  connectionStatus: DeviceConnectionStatus;
  lastSyncedAt: string | null;
}

export interface GlobalContextValue {
  activeUser: AppUser | null;
  setActiveUser: (user: AppUser | null) => void;

  activeDevice: WearableDevice | null;
  setActiveDevice: (device: WearableDevice | null) => void;

  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;

  // PR3.11
  telemetry: import('../services/firebase/telemetryService').TelemetryPayload | null;

  telemetryConnected: boolean;

  telemetryLoading: boolean;
}
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  timestamp: string;
}

export type Nullable<T> = T | null;
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';
