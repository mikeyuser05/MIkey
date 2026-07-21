import React, { createContext, useContext, useState, useEffect } from 'react';
import { IPipelineState } from '../intelligence/pipeline/pipelineTypes';
import { PipelineOrchestrator } from '../intelligence/pipeline/pipelineOrchestrator';
import { telemetryService, TelemetryPayload } from '../services/firebase/telemetryService';

export interface IGlobalContextType {
  pipelineData: IPipelineState | null;
  isLoading: boolean;
  error: string | null;
}

export const GlobalContext = createContext<IGlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pipelineData, setPipelineData] = useState<IPipelineState | null>(() => {
    return PipelineOrchestrator.getInstance().getLastState();
  });
  const [isLoading, setIsLoading] = useState<boolean>(!pipelineData);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const orchestrator = PipelineOrchestrator.getInstance();
    
    // 1. Listen to raw Firebase stream and push it into the AI/Analytics Pipeline
    const unsubscribeFirebase = telemetryService.subscribe((payload: TelemetryPayload) => {
      // Map raw frame onto orchestrator input layer structure if exposed, 
      // otherwise feed orchestrator dynamic processing cycle
      const rawTelemetryFrame = {
        deviceId: 'ESP32_MAIN',
        timestamp: payload.timestamp,
        heartRate: payload.heartRate,
        spo2: payload.spo2,
        gasConcentration: payload.gas,
        rawAcceleration: { x: 0, y: 0, z: 0 }
      };

      // Custom transformation update trigger
      // @ts-ignore (If ingest/process is exposed on orchestrator instance)
      if (typeof orchestrator.processFrame === 'function') {
        // @ts-ignore
        orchestrator.processFrame(rawTelemetryFrame);
      }
    });

    // 2. Singular exclusive pipeline updates event binding channel
    const unsubscribePipeline = orchestrator.subscribe((latestState) => {
      setPipelineData(latestState);
      setIsLoading(false);
    });

    return () => {
      unsubscribeFirebase();
      unsubscribePipeline();
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
};