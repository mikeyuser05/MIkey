import React, { createContext, useContext, useState, useEffect } from 'react';
import { IPipelineState } from '../intelligence/pipeline/pipelineTypes';
import { PipelineOrchestrator } from '../intelligence/pipeline/pipelineOrchestrator';
import { telemetryService, TelemetryPayload } from '../services/firebase/telemetryService';

export interface IGlobalContextType {
  pipelineData: IPipelineState | null;
  telemetry: TelemetryPayload | null;
  telemetryConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const GlobalContext = createContext<IGlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pipelineData, setPipelineData] = useState<IPipelineState | null>(() => {
    return PipelineOrchestrator.getInstance().getLastState();
  });
  const [telemetry, setTelemetry] = useState<TelemetryPayload | null>(null);
  const [telemetryConnected, setTelemetryConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(!pipelineData);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const orchestrator = PipelineOrchestrator.getInstance();

    // Listen to raw Firebase stream
    const unsubscribeFirebase = telemetryService.subscribe((payload: TelemetryPayload) => {
      setTelemetry(payload);
      setTelemetryConnected(true);

      const extendedPayload = payload as any;

      const rawTelemetryFrame = {
        deviceId: extendedPayload?.deviceId || 'ESP32_MAIN',
        timestamp: payload.timestamp,
        heartRate: payload.heartRate,
        spo2: payload.spo2,
        gasConcentration: payload.gas,
        rawAcceleration: extendedPayload?.rawAcceleration || { x: 0, y: 0, z: 0 }
      };

      const orchestratorInstance = orchestrator as any;
      if (typeof orchestratorInstance.processFrame === 'function') {
        orchestratorInstance.processFrame(rawTelemetryFrame);
      }
    });

    // Singular exclusive pipeline updates event binding channel
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
    <GlobalContext.Provider value={{ pipelineData, telemetry, telemetryConnected, isLoading, error }}>
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