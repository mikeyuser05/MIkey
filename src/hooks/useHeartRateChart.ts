import { useEffect, useRef, useState, useMemo } from 'react';
import { useLiveVitals } from './useLiveVitals';
import { ChartBuffer } from '../engine/ChartBuffer';
import { LiveChartEngine } from '../engine/LiveChartEngine';
import { TimeWindowSize, UseLiveChartResult } from '../types/chartEngine.types';
import { formatTimeLabel } from '../utils/chartFormatter';

export const useHeartRateChart = (windowSize: TimeWindowSize = '1m'): UseLiveChartResult => {
  const { heartRate, isLoading } = useLiveVitals();
  const [tick, setTick] = useState(0);
  const bufferRef = useRef<ChartBuffer>(new ChartBuffer(windowSize));
  const prevValueRef = useRef<number>(heartRate);

  useEffect(() => {
    if (isLoading || heartRate === 0) return;
    const now = Date.now();
    if (heartRate !== prevValueRef.current) {
      bufferRef.current.push(heartRate, now, formatTimeLabel(now));
      prevValueRef.current = heartRate;
      setTick(t => t + 1);
    }
  }, [heartRate, isLoading]);

  return { data: useMemo(() => bufferRef.current.getPoints(), [tick]), stats: useMemo(() => LiveChartEngine.calculateStats(bufferRef.current.getPoints()), [tick]), isLoading };
};