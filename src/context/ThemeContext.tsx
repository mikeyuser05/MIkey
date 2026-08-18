import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { ThemeContextValue, ThemeMode, ThemePalette } from '@app-types/theme.types';
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
  
  // Secondary Palette State (Default: Cyber Blue)
  const [palette, setPaletteState] = useState<ThemePalette>(() =>
    getStorageItem<ThemePalette>('HPO_THEME_PALETTE', 'cyber'),
  );

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(mode));

  // Sync Light/Dark Class & Palette Class on <html> Root
  useEffect(() => {
    const root = window.document.documentElement;
    const next = resolveTheme(mode);
    setResolvedTheme(next);
    
    root.classList.toggle('dark', next === 'dark');
    
    // Manage Palette Classes without overwriting dark mode
    root.classList.remove('theme-cyber', 'theme-tactical', 'theme-clinical');
    root.classList.add(`theme-${palette}`);
  }, [mode, palette]);

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

  const setPalette = useCallback((nextPalette: ThemePalette) => {
    setPaletteState(nextPalette);
    setStorageItem('HPO_THEME_PALETTE', nextPalette);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, palette, setMode, setPalette, toggleTheme }),
    [mode, resolvedTheme, palette, setMode, setPalette, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}