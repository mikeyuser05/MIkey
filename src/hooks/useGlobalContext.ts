import { useContext } from 'react';
import { GlobalContext } from '@context/GlobalContext';
import type { GlobalContextValue } from '@app-types/global.types';

export function useGlobalContext(): GlobalContextValue {
  const context = useContext(GlobalContext);

  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }

  return context;
}
