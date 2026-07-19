import { IPeriodicReport, IAggregatedMetrics, IHealthScoreBreakdown } from '../types/reports';
import { IReportConfig } from '../config/reportConfig';

/**
 * Pure deterministic monthly report builder.
 * Aggregates extended long-term data blocks to compile macro-level trends and variances.
 */
export const buildMonthlyReport = (
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

  if (count < config.minDataPointsRequired.MONTHLY) {
    throw new Error(`Insufficient data blocks to evaluate monthly report context. Provided: ${count}`);
  }

  let hrMin = Infinity, hrMax = -Infinity, hrSum = 0;
  let spo2Min = Infinity, spo2Max = -Infinity, spo2Sum = 0;
  let gasMin = Infinity, gasMax = -Infinity, gasSum = 0;
  let totalAlerts = 0;
  let scoreSum = 0;
  const riskCounts: Record<string, number> = {};

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

    day.riskCategories.forEach(risk => {
      riskCounts[risk] = (riskCounts[risk] || 0) + 1;
    });
  }

  const metrics: IAggregatedMetrics = {
    heartRate: { min: hrMin, max: hrMax, average: Math.round(hrSum / count) },
    spo2: { min: spo2Min, max: spo2Max, average: Math.round(spo2Sum / count) },
    gas: { min: gasMin, max: gasMax, average: Math.round(gasSum / count) }
  };

  const avgScore = Math.round(scoreSum / count);
  
  // Monthly macro analysis profiles variance penalties if metrics continuously stray
  const cardioScore = metrics.heartRate.max - metrics.heartRate.min > 60 ? 75 : 92;
  const respScore = metrics.spo2.average < 92 ? 78 : 96;
  const envScore = totalAlerts > 10 ? 65 : 98;

  const healthScores: IHealthScoreBreakdown = {
    cardiovascularScore: cardioScore,
    respiratoryScore: respScore,
    environmentalSafetyScore: envScore,
    overallHealthScore: avgScore
  };

  // Strategic directive determination for systemic macro behaviors
  const primaryRiskDirectives: string[] = [];
  if ((riskCounts['CARDIOVASCULAR'] || 0) > 3 || metrics.heartRate.average > 95) {
    primaryRiskDirectives.push('SYSTEMIC_CARDIOVASCULAR_CONDITIONING_REQUIRED');
  }
  if ((riskCounts['RESPIRATORY'] || 0) > 3 || metrics.spo2.min < config.criticalSpo2Threshold) {
    primaryRiskDirectives.push('CRITICAL_RESPIRATORY_CAPACITY_EVALUATION');
  }
  if (totalAlerts > 15) {
    primaryRiskDirectives.push('EXCESSIVE_ENVIRONMENTAL_RISK_EXPOSURE');
  }
  if (primaryRiskDirectives.length === 0) {
    primaryRiskDirectives.push('EXCELLENT_MONTHLY_STABILITY_PROFILE');
  }

  return {
    id: `rpt_monthly_${startTimestamp}_${generatedTimestamp}`,
    type: 'MONTHLY',
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