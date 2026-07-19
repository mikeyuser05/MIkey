/**
 * NOEXCUSE HPO V2: PR4.7 Periodic Health Reports Domain Types
 */

export type ReportType = 'WEEKLY' | 'MONTHLY';

export interface IAggregatedMetrics {
  heartRate: { min: number; max: number; average: number };
  spo2: { min: number; max: number; average: number };
  gas: { min: number; max: number; average: number };
}

export interface IHealthScoreBreakdown {
  cardiovascularScore: number;
  respiratoryScore: number;
  environmentalSafetyScore: number;
  overallHealthScore: number;
}

export interface IPeriodicReport {
  id: string;
  type: ReportType;
  startTimestamp: number;
  endTimestamp: number;
  generatedTimestamp: number;
  dataPointsEvaluated: number;
  metrics: IAggregatedMetrics;
  healthScores: IHealthScoreBreakdown;
  criticalAlertCount: number;
  primaryRiskDirectives: string[];
}

export interface IReportEngine {
  generatePeriodicReport(
    type: ReportType,
    dailySummaries: Array<{
      timestamp: number;
      metricsSnapshot: { heartRate: number; spo2: number; gas: number };
      healthScore: number;
      alertCount: number;
      riskCategories: string[];
    }>,
    startTimestamp: number,
    endTimestamp: number
  ): IPeriodicReport;
}\n