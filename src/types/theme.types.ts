export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemePalette = 'cyber' | 'tactical' | 'clinical';

export interface ThemeContextValue {
  /** The mode explicitly selected by the user (may be 'system'). */
  mode: ThemeMode;
  /** The resolved theme actually applied to the DOM ('light' | 'dark'). */
  resolvedTheme: Exclude<ThemeMode, 'system'>;
  /** The specific color scheme palette variant currently active. */
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  toggleTheme: () => void;
}
