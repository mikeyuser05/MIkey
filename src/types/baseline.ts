/**
 * NOEXCUSE HPO V2 - Baseline Collection Domain Types
 * Phase PR5.3: Baseline Collection Engine
 */

export type BaselineConfidence = 'LOW' | 'MODERATE' | 'HIGH' | 'ESTABLISHED';

export interface MetricBaselineStats {
  sampleCount: number;
  mean: number;
  stdDev: number;
  median: number;
  minObserved: number;
  maxObserved: number;
  lastUpdated: number;
}

export interface PersonalBaselineState {
  userId: string;
  updatedAt: number;
  confidence: BaselineConfidence;
  overallConfidenceScore: number; // 0.0 to 1.0 (based on valid sample density)
  restingHeartRate: MetricBaselineStats;
  baselineSpo2: MetricBaselineStats;
  baselineGasLevel: MetricBaselineStats;
  windowStartTimestamp: number;
  windowEndTimestamp: number;
}
