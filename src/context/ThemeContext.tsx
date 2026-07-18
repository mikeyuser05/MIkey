import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { ThemeContextValue, ThemeMode } from '@app-types/theme.types';
import { STORAGE_KEYS } from '@constants/app.constants';
import { getStorageItem, setStorageItem } from '@utils/storage';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  const [mode, setModeState] = useState<ThemeMode>(() =>
    getStorageItem<ThemeMode>(STORAGE_KEYS.THEME_MODE, 'system'),
  );
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(mode));

  useEffect(() => {
    const root = window.document.documentElement;
    const next = resolveTheme(mode);
    setResolvedTheme(next);
    root.classList.toggle('dark', next === 'dark');
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      const next = getSystemTheme();
      setResolvedTheme(next);
      window.document.documentElement.classList.toggle('dark', next === 'dark');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setStorageItem(STORAGE_KEYS.THEME_MODE, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode, toggleTheme }),
    [mode, resolvedTheme, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
