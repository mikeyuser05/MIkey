/**
 * @file normalRange.ts
 * @description Interfaces for calculated personal normal bands and boundary thresholds.
 */

export interface NumericRange {
  lower: number;
  upper: number;
  target: number;
}

export interface PersonalNormalRanges {
  heartRateResting: NumericRange;
  heartRateActive: NumericRange; // Upper ceiling based on max HR target zones
  spO2Resting: NumericRange;
  isEmpiricallyDerived: boolean;
  derivedAtIso: string;
}
