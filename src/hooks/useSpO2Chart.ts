import { useEffect, useRef, useState, useMemo } from 'react';
import { useLiveVitals } from './useLiveVitals';
import { ChartBuffer } from '../engine/ChartBuffer';
import { LiveChartEngine } from '../engine/LiveChartEngine';
import { TimeWindowSize, UseLiveChartResult } from '../types/chartEngine.types';
import { formatTimeLabel } from '../utils/chartFormatter';

export const useSpO2Chart = (windowSize: TimeWindowSize = '1m'): UseLiveChartResult => {
  const { spO2, isLoading } = useLiveVitals();
  const [tick, setTick] = useState(0);
  const bufferRef = useRef<ChartBuffer>(new ChartBuffer(windowSize));
  const prevValueRef = useRef<number>(spO2);

  useEffect(() => {
    if (isLoading || spO2 === 0) return;
    const now = Date.now();
    if (spO2 !== prevValueRef.current) {
      bufferRef.current.push(spO2, now, formatTimeLabel(now));
      prevValueRef.current = spO2;
      setTick(t => t + 1);
    }
  }, [spO2, isLoading]);

  return { data: useMemo(() => bufferRef.current.getPoints(), [tick]), stats: useMemo(() => LiveChartEngine.calculateStats(bufferRef.current.getPoints()), [tick]), isLoading };
};