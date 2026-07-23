/**
 * NOEXCUSE HPO V2 - Personal Deviation Types
 * Phase PR5.5: Personal Deviation Detection Engine
 */

export type DeviationSeverity = 'NORMAL' | 'MILD_DEVIATION' | 'MODERATE_DEVIATION' | 'CRITICAL_DEVIATION';

export interface MetricDeviationResult {
  currentValue: number | null;
  baselineMean: number;
  lowerBound: number;
  upperBound: number;
  deltaFromMean: number;
  deltaFromBoundary: number; // Positive if outside limits, 0 if within normal limits
  severity: DeviationSeverity;
  isAboveNormal: boolean;
  isBelowNormal: boolean;
  explanation: string;
}

export interface PersonalDeviationState {
  timestamp: number;
  userId: string;
  heartRateDeviation: MetricDeviationResult;
  spo2Deviation: MetricDeviationResult;
  gasDeviation: MetricDeviationResult;
  hasAnyDeviation: boolean;
  maxSeverity: DeviationSeverity;
}
