import { useEffect, useRef, useState, useMemo } from 'react';
import { useLiveVitals } from './useLiveVitals';
import { ChartBuffer } from '../engine/ChartBuffer';
import { LiveChartEngine } from '../engine/LiveChartEngine';
import { TimeWindowSize, UseLiveChartResult } from '../types/chartEngine.types';
import { formatTimeLabel } from '../utils/chartFormatter';

export const useGasChart = (windowSize: TimeWindowSize = '1m'): UseLiveChartResult => {
  const { gas, isLoading } = useLiveVitals();
  const [tick, setTick] = useState(0);
  const bufferRef = useRef<ChartBuffer>(new ChartBuffer(windowSize));
  const prevValueRef = useRef<number>(gas);

  useEffect(() => {
    if (isLoading) return;
    const now = Date.now();
    if (gas !== prevValueRef.current) {
      bufferRef.current.push(gas, now, formatTimeLabel(now));
      prevValueRef.current = gas;
      setTick(t => t + 1);
    }
  }, [gas, isLoading]);

  return { data: useMemo(() => bufferRef.current.getPoints(), [tick]), stats: useMemo(() => LiveChartEngine.calculateStats(bufferRef.current.getPoints()), [tick]), isLoading };
};