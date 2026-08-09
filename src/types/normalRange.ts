/**
 * @file normalRange.ts
 * @description Interfaces for calculated personal normal bands and boundary thresholds.
 */

export interface NumericRange {
  lower: number;
  upper: number;
  target: number;
  lowerBound?: number;
  upperBound?: number;
  targetMean?: number;
  toleranceMargin?: number;
  isStatedProfileFallback?: boolean;
}

export type SingleMetricRange = NumericRange;

export interface PersonalNormalRanges {
  userId?: string;
  calculatedAt?: number;
  confidence?: string;
  heartRateResting: NumericRange;
  heartRateActive: NumericRange;
  spO2Resting: NumericRange;
  isEmpiricallyDerived: boolean;
  derivedAtIso: string;
  heartRateRange?: NumericRange;
  spo2Range?: NumericRange;
  gasRange?: NumericRange;
}