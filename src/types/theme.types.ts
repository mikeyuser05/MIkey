export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  /** The mode explicitly selected by the user (may be 'system'). */
  mode: ThemeMode;
  /** The resolved theme actually applied to the DOM ('light' | 'dark'). */
  resolvedTheme: Exclude<ThemeMode, 'system'>;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
