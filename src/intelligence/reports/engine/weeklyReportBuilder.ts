import { IPeriodicReport, IAggregatedMetrics, IHealthScoreBreakdown } from '../types/reports';
import { IReportConfig } from '../config/reportConfig';

/**
 * Pure deterministic weekly report builder.
 * Aggregates up to 7 trailing daily data segments into a standardized long-term summary.
 */
export const buildWeeklyReport = (
  dailySummaries: Array<{
    timestamp: number;
    metricsSnapshot: { heartRate: number; spo2: number; gas: number };
    healthScore: number;
    alertCount: number;
    riskCategories: string[];
  }>,
  startTimestamp: number,
  endTimestamp: number,
  config: IReportConfig
): IPeriodicReport => {
  const generatedTimestamp = Date.now();
  const count = dailySummaries.length;

  if (count < config.minDataPointsRequired.WEEKLY) {
    throw new Error(`Insufficient data blocks to evaluate weekly report context. Provided: ${count}`);
  }

  // 1. Core Structural Metrics Accumulation
  let hrMin = Infinity, hrMax = -Infinity, hrSum = 0;
  let spo2Min = Infinity, spo2Max = -Infinity, spo2Sum = 0;
  let gasMin = Infinity, gasMax = -Infinity, gasSum = 0;
  let totalAlerts = 0;
  let scoreSum = 0;
  const riskSet = new Set<string>();

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

    totalAlerts += day.alertCount;
    scoreSum += day.healthScore;

    day.riskCategories.forEach(risk => riskSet.add(risk));
  }

  const metrics: IAggregatedMetrics = {
    heartRate: { min: hrMin, max: hrMax, average: Math.round(hrSum / count) },
    spo2: { min: spo2Min, max: spo2Max, average: Math.round(spo2Sum / count) },
    gas: { min: gasMin, max: gasMax, average: Math.round(gasSum / count) }
  };

  // 2. Deterministic Sub-Score Breakdown Rules
  const avgScore = Math.round(scoreSum / count);
  const cardioScore = metrics.heartRate.average > 100 || metrics.heartRate.average < 50 ? 60 : 95;
  const respScore = metrics.spo2.average < config.criticalSpo2Threshold ? 50 : 98;
  const envScore = metrics.gas.average >= config.criticalGasThreshold ? 40 : 99;

  const healthScores: IHealthScoreBreakdown = {
    cardiovascularScore: cardioScore,
    respiratoryScore: respScore,
    environmentalSafetyScore: envScore,
    overallHealthScore: avgScore
  };

  // 3. Conditional Strategic Recommendation Directives
  const primaryRiskDirectives: string[] = [];
  if (riskSet.has('CARDIOVASCULAR') || cardioScore < 70) {
    primaryRiskDirectives.push('SCHEDULE_CARDIOVASCULAR_REST_BLOCKS');
  }
  if (riskSet.has('RESPIRATORY') || respScore < 88) {
    primaryRiskDirectives.push('MONITOR_RESPIRATORY_BASELINE_STABILITY');
  }
  if (totalAlerts > 3) {
    primaryRiskDirectives.push('REDUCE_OPERATIONAL_LOAD_THRESHOLDS');
  }
  if (primaryRiskDirectives.length === 0) {
    primaryRiskDirectives.push('MAINTAIN_CURRENT_TRAINING_REGIMEN');
  }

  return {
    id: `rpt_weekly_${startTimestamp}_${generatedTimestamp}`,
    type: 'WEEKLY',
    startTimestamp,
    endTimestamp,
    generatedTimestamp,
    dataPointsEvaluated: count,
    metrics,
    healthScores,
    criticalAlertCount: totalAlerts,
    primaryRiskDirectives
  };
};