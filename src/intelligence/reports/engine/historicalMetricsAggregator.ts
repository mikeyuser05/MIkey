import { IAggregatedMetrics } from '../types/reports';

/**
 * Pure deterministic historical metrics aggregator node.
 * Compiles raw historical ranges into bounded maximums, minimums, and statistical means.
 */
export const aggregateHistoricalMetrics = (
  dailySummaries: Array<{
    metricsSnapshot: { heartRate: number; spo2: number; gas: number };
  }>
): IAggregatedMetrics => {
  const count = dailySummaries.length;
  if (count === 0) {
    return {
      heartRate: { min: 0, max: 0, average: 0 },
      spo2: { min: 0, max: 0, average: 0 },
      gas: { min: 0, max: 0, average: 0 }
    };
  }

  let hrMin = Infinity, hrMax = -Infinity, hrSum = 0;
  let spo2Min = Infinity, spo2Max = -Infinity, spo2Sum = 0;
  let gasMin = Infinity, gasMax = -Infinity, gasSum = 0;

  for (const day of dailySummaries) {
    const { heartRate, spo2, gas } = day.metricsSnapshot;

    if (heartRate < hrMin) hrMin = heartRate;
    if (heartRate > hrMax) hrMax = heartRate;
    hrSum += heartRate;

    if (spo2 < spo2Min) spo2Min = spo2;
    if (spo2 > spo2Max) spo2Max = spo2;
    spo2Sum += spo2;

    if (gas < gasMin) gasMin = gas;
    if (gas > gasMax) gasMax = gas;
    gasSum += gas;
  }

  return {
    heartRate: { min: hrMin, max: hrMax, average: Math.round(hrSum / count) },
    spo2: { min: spo2Min, max: spo2Max, average: Math.round(spo2Sum / count) },
    gas: { min: gasMin, max: gasMax, average: Math.round(gasSum / count) }
  };
};\n