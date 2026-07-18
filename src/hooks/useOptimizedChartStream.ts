import { useState, useEffect, useMemo } from 'react';

export interface TelemetryFrame {
  timestamp: string;
  epoch: number;
  heartRate: number;
  spo2: number;
  temperature: number;
  gas: number;
}

export const useOptimizedChartStream = (nodeId: 'PR1' | 'PR2', metric: string, windowMs: number = 300000) => {
  const [streamData, setStreamData] = useState<TelemetryFrame[]>([]);

  useEffect(() => {
    console.log(`[SUBSCRIPTION INITIALIZED] Active Realtime Channel open for Node: ${nodeId}`);
    
    // Simulating subscription socket or stream link initialization
    const dynamicStreamInterval = setInterval(() => {
      const rightNow = new Date();
      const timeLabel = rightNow.toTimeString().split(' ')[0];
      
      const deterministicMetricValue = metric === 'heartRate' 
        ? Math.floor(70 + Math.sin(Date.now() / 10000) * 15) 
        : Math.floor(96 + Math.cos(Date.now() / 15000) * 2);

      setStreamData(prevFrames => {
        const appended = [
          ...prevFrames,
          {
            timestamp: timeLabel,
            epoch: Date.now(),
            heartRate: metric === 'heartRate' ? deterministicMetricValue : 72,
            spo2: metric === 'spo2' ? deterministicMetricValue : 98,
            temperature: 36.5,
            gas: 420
          }
        ];
        
        // Performance Bound: Evict stale frames beyond historical window criteria edge boundary
        const boundaryEpoch = Date.now() - windowMs;
        return appended.filter(frame => frame.epoch >= boundaryEpoch);
      });
    }, 1000);

    // CRITICAL FIX: Memory leakage remediation hook vector. 
    // Cleans up active real-time telemetry listeners when components unmount.
    return () => {
      console.log(`[SUBSCRIPTION TERMINATED] Safely detached listener instances for Node: ${nodeId}`);
      clearInterval(dynamicStreamInterval);
    };
  }, [nodeId, metric, windowMs]);

  // Memoize data to isolate the rendering canvas from parent update interference
  return useMemo(() => streamData, [streamData]);
};