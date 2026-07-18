// src/telemetry/context/TelemetryContext.tsx
import React, { createContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { TelemetryState } from '../types';
import { telemetryReducer, initialState, TelemetryAction } from './telemetryReducer';
import { TelemetryService } from '../services/telemetryService';
import { TelemetryRepository } from '../repository/telemetryRepository';

export interface TelemetryContextProps {
  state: TelemetryState;
  dispatch: React.Dispatch<TelemetryAction>;
  service: TelemetryService;
}

export const TelemetryContext = createContext<TelemetryContextProps | undefined>(undefined);

// Instantiate the single-responsibility long-lived service instances outside component lifecycles
const sharedRepository = new TelemetryRepository();
const sharedService = new TelemetryService(sharedRepository);

interface TelemetryProviderProps {
  children: ReactNode;
}

export const TelemetryProvider: React.FC<TelemetryProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(telemetryReducer, initialState);

  // Monitor the global network transport layer connection state automatically
  useEffect(() => {
    const unsubscribeConnection = sharedService.monitorConnectionLifecycle((status) => {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
    });

    return () => {
      unsubscribeConnection();
    };
  }, []);

  // Memoize context contents to prevent unnecessary downstream re-renders
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    service: sharedService
  }), [state]);

  return (
    <TelemetryContext.Provider value={contextValue}>
      {children}
    </TelemetryContext.Provider>
  );
};
