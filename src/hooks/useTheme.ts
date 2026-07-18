import { useContext } from 'react';
import { ThemeContext } from '@context/ThemeContext';
import type { ThemeContextValue } from '@app-types/theme.types';

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
