import { IRollingMetrics } from '../types/trends';

/**
 * Pure deterministic rolling analytics processor.
 * Calculates exact min, max, and running averages across a given telemetry buffer.
 */
export const calculateRollingStats = (
  history: { heartRate: number; spo2: number; gas: number }[]
): IRollingMetrics => {
  const defaultMetrics = { min: 0, max: 0, avg: 0 };

  if (!history || history.length === 0) {
    return {
      heartRate: { ...defaultMetrics },
      spo2: { ...defaultMetrics },
      gas: { ...defaultMetrics }
    };
  }

  let hrMin = Infinity, hrMax = -Infinity, hrSum = 0;
  let o2Min = Infinity, o2Max = -Infinity, o2Sum = 0;
  let gasMin = Infinity, gasMax = -Infinity, gasSum = 0;

  const totalPoints = history.length;

  for (let i = 0; i < totalPoints; i++) {
    const node = history[i];

    // Heart Rate Bounds
    if (node.heartRate < hrMin) hrMin = node.heartRate;
    if (node.heartRate > hrMax) hrMax = node.heartRate;
    hrSum += node.heartRate;

    // SpO2 Bounds
    if (node.spo2 < o2Min) o2Min = node.spo2;
    if (node.spo2 > o2Max) o2Max = node.spo2;
    o2Sum += node.spo2;

    // Gas Bounds
    if (node.gas < gasMin) gasMin = node.gas;
    if (node.gas > gasMax) gasMax = node.gas;
    gasSum += node.gas;
  }

  return {
    heartRate: { min: hrMin, max: hrMax, avg: Number((hrSum / totalPoints).toFixed(1)) },
    spo2: { min: o2Min, max: o2Max, avg: Number((o2Sum / totalPoints).toFixed(1)) },
    gas: { min: gasMin, max: gasMax, avg: Number((gasSum / totalPoints).toFixed(1)) }
  };
};