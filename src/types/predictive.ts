/**
 * NOEXCUSE HPO V2 - Early-Warning Predictive Anomaly Types
 * Phase PR6.3: Early-Warning Predictive Anomaly Engine
 */

import { OverallRiskLevel } from './riskScore';

export type PredictiveAlertLevel = 'NONE' | 'WATCH' | 'WARNING' | 'CRITICAL_PREDICTED';

export interface MetricBreachPrediction {
  metricName: string;
  predictedValue5Min: number;
  timeToBreachSeconds: number | null; // Null if no breach projected
  willBreachBoundary: boolean;
  targetBoundary: 'UPPER' | 'LOWER' | 'NONE';
}

export interface EarlyWarningResult {
  timestamp: number;
  userId: string;
  alertLevel: PredictiveAlertLevel;
  hrPrediction: MetricBreachPrediction;
  spo2Prediction: MetricBreachPrediction;
  gasPrediction: MetricBreachPrediction;
  earliestBreachSeconds: number | null;
  summaryWarning: string;
}
