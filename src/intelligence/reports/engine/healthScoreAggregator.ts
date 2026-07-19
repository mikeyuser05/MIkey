import { IHealthScoreBreakdown, IAggregatedMetrics } from '../types/reports';
import { IReportConfig } from '../config/reportConfig';

/**
 * Pure deterministic health score aggregator node.
 * Evaluates physiological and environmental averages against static limits
 * to calculate mathematical subsystem and overall health scores.
 */
export const calculateAggregatedHealthScores = (
  metrics: IAggregatedMetrics,
  averageDailyScore: number,
  totalAlerts: number,
  config: IReportConfig
): IHealthScoreBreakdown => {
  
  // 1. Cardiovascular Score Determination
  let cardiovascularScore = 100;
  const avgHR = metrics.heartRate.average;
  
  if (avgHR > 100 || avgHR < 50) {
    cardiovascularScore = 60;
  } else if (avgHR > 90 || avgHR < 60) {
    cardiovascularScore = 80;
  } else {
    cardiovascularScore = 95;
  }

  // 2. Respiratory Score Determination
  let respiratoryScore = 100;
  const avgSpo2 = metrics.spo2.average;
  const minSpo2 = metrics.spo2.min;

  if (avgSpo2 < config.criticalSpo2Threshold || minSpo2 < 80) {
    respiratoryScore = 50;
  } else if (avgSpo2 < 93) {
    respiratoryScore = 75;
  } else {
    respiratoryScore = 98;
  }

  // 3. Environmental Safety Score Determination
  let environmentalSafetyScore = 100;
  const avgGas = metrics.gas.average;

  if (avgGas >= config.criticalGasThreshold || totalAlerts > 10) {
    environmentalSafetyScore = 40;
  } else if (avgGas > 400 || totalAlerts > 3) {
    environmentalSafetyScore = 70;
  } else {
    environmentalSafetyScore = 99;
  }

  // 4. Overall Health Score Composite
  // Captures the historical running baseline while bound to subsystem health limits
  const calculatedOverall = Math.round(
    (cardiovascularScore + respiratoryScore + environmentalSafetyScore + averageDailyScore) / 4
  );

  return {
    cardiovascularScore,
    respiratoryScore,
    environmentalSafetyScore,
    overallHealthScore: Math.max(0, Math.min(100, calculatedOverall))
  };
};