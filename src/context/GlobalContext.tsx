/**
 * NOEXCUSE HPO V2: PR4.11.5 Global State Integration Layer Context
 * Binds the PipelineOrchestrator execution payload directly to the dashboard application.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IPipelineState } from '../intelligence/pipeline/pipelineTypes';
import { PipelineOrchestrator } from '../intelligence/pipeline/pipelineOrchestrator';

export interface IGlobalContextType {
  pipelineData: IPipelineState | null;
  isLoading: boolean;
  error: string | null;
}

const GlobalContext = createContext<IGlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pipelineData, setPipelineData] = useState<IPipelineState | null>(() => {
    return PipelineOrchestrator.getInstance().getLastState();
  });
  const [isLoading, setIsLoading] = useState<boolean>(!pipelineData);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const orchestrator = PipelineOrchestrator.getInstance();
    
    // Establish singular exclusive event binding channel
    const unsubscribe = orchestrator.subscribe((latestState) => {
      setPipelineData(latestState);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ pipelineData, isLoading, error }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalState = (): IGlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be consumed exclusively within a structural GlobalProvider context frame.');
  }
  return context;
};\n