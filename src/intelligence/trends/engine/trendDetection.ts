import { ITrendVector, TrendDirection } from '../types/trends';
import { ITrendConfig } from '../config/trendConfig';

/**
 * Pure deterministic calculation node computing trend vectors by comparing
 * early historical baselines against recent sliding window averages.
 */
export const calculateTrendVector = (
  values: number[],
  significantDelta: number,
  config: ITrendConfig
): ITrendVector => {
  if (!values || values.length < config.minDataPointsForTrend) {
    return { direction: 'UNKNOWN', deltaValue: 0 };
  }

  const midPoint = Math.floor(values.length / 2);
  const earlySlice = values.slice(0, midPoint);
  const recentSlice = values.slice(midPoint);

  if (earlySlice.length === 0 || recentSlice.length === 0) {
    return { direction: 'UNKNOWN', deltaValue: 0 };
  }

  const earlyAvg = earlySlice.reduce((sum, v) => sum + v, 0) / earlySlice.length;
  const recentAvg = recentSlice.reduce((sum, v) => sum + v, 0) / recentSlice.length;
  
  const deltaValue = Number((recentAvg - earlyAvg).toFixed(2));

  let direction: TrendDirection = 'STABLE';
  if (deltaValue >= significantDelta) {
    direction = 'RISING';
  } else if (deltaValue <= -significantDelta) {
    direction = 'FALLING';
  }

  return { direction, deltaValue };
};

/**
 * Evaluates trend vectors across all raw telemetry parameters over a dataset history.
 */
export const detectTrends = (
  history: { heartRate: number; spo2: number; gas: number }[],
  config: ITrendConfig
): { heartRate: ITrendVector; spo2: ITrendVector; gas: ITrendVector } => {
  const hrValues = history.map(h => h.heartRate);
  const o2Values = history.map(h => h.spo2);
  const gasValues = history.map(h => h.gas);

  return {
    heartRate: calculateTrendVector(hrValues, config.significantDeltas.heartRate, config),
    spo2: calculateTrendVector(o2Values, config.significantDeltas.spo2, config),
    gas: calculateTrendVector(gasValues, config.significantDeltas.gas, config)
  };
};\n