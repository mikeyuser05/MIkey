/**
 * NOEXCUSE HPO V2 - Risk Score Types
 * Phase PR6.1: Multi-Sensor Health Risk Scoring Engine
 */

import { DeviationSeverity } from './deviation';

export type OverallRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface MetricRiskContribution {
  metricName: string;
  weight: number;
  rawDeviationScore: number; // 0 to 100
  weightedScore: number;
  severity: DeviationSeverity;
}

export interface HealthRiskScoreResult {
  timestamp: number;
  userId: string;
  overallScore: number; // 0 (Healthy) to 100 (Critical Risk)
  riskLevel: OverallRiskLevel;
  contributions: {
    heartRate: MetricRiskContribution;
    spo2: MetricRiskContribution;
    gasLevel: MetricRiskContribution;
  };
  dominantRiskFactor: string;
  summaryExplanation: string;
}
