/**
 * NOEXCUSE HPO V2 - Individual Normal Range Types
 * Phase PR5.4: Individual Normal Range Engine
 */

import { BaselineConfidence } from './baseline';

export interface SingleMetricRange {
  lowerBound: number;
  upperBound: number;
  targetMean: number;
  toleranceMargin: number;
  isStatedProfileFallback: boolean;
}

export interface PersonalNormalRanges {
  userId: string;
  calculatedAt: number;
  confidence: BaselineConfidence;
  heartRateRange: SingleMetricRange;
  spo2Range: SingleMetricRange;
  gasRange: SingleMetricRange;
}
