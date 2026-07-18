import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { GlobalContextValue, WearableDevice } from '@app-types/global.types';
import type { AppUser } from '@app-types/user.types';
import { STORAGE_KEYS } from '@constants/app.constants';
import { getStorageItem, setStorageItem } from '@utils/storage';
import {
  telemetryRepository,
  type TelemetryState,
} from '../repositories/telemetryRepository';
import type { TelemetryPayload } from '../services/firebase/telemetryService';

export const GlobalContext = createContext<GlobalContextValue | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps): ReactElement {
  const [activeUser, setActiveUser] = useState<AppUser | null>(null);
  const [activeDevice, setActiveDevice] = useState<WearableDevice | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() =>
    getStorageItem<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false),
  );
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [telemetryConnected, setTelemetryConnected] = useState(false);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      setStorageItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = telemetryRepository.subscribe(
      (state: TelemetryState) => {
        // 👇 Added the debugging log right before state changes
        console.log("GlobalContext received", state);

        setTelemetry(state.data);
        setTelemetryConnected(state.connected);
        setTelemetryLoading(state.loading);
      },
    );

    return unsubscribe;
  }, []);

  const value = useMemo<GlobalContextValue>(
    () => ({
      activeUser,
      setActiveUser,
      activeDevice,
      setActiveDevice,
      isSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      setMobileSidebarOpen,
      telemetry,
      telemetryConnected,
      telemetryLoading,
    }),
    [
      activeUser,
      activeDevice,
      isSidebarCollapsed,
      toggleSidebar,
      isMobileSidebarOpen,
      telemetry,
      telemetryConnected,
      telemetryLoading,
    ],
  );

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>;
}

import { useContext } from 'react';
export function useGlobalContext(): GlobalContextValue {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      'useGlobalContext must be used within GlobalProvider',
    );
  }

  return context;
}