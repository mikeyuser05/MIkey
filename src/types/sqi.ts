/**
 * @file sqi.ts
 * @description Types for Signal Quality Index (SQI) validation.
 */

export type SQIGrade = 'EXCELLENT' | 'ACCEPTABLE' | 'DEGRADED' | 'INVALID';

export type SQIFailureReason =
  | 'MISSING_DATA'
  | 'STALE_DATA'
  | 'HR_OUT_OF_PHYSIOLOGICAL_RANGE'
  | 'SPO2_OUT_OF_PHYSIOLOGICAL_RANGE'
  | 'IMPLAUSIBLE_HR_SPIKE'
  | 'IMPLAUSIBLE_SPO2_DROP'
  | 'HIGH_MOTION_ARTIFACT';

export interface TelemetryReadingInput {
  timestampMs: number;
  heartRate: number | null | undefined;
  spO2: number | null | undefined;
  steps?: number;
  accelMagnitude?: number;
}

export interface SQIEvaluationResult {
  grade: SQIGrade;
  score: number;
  isValidForBaseline: boolean;
  flags: SQIFailureReason[];
  evaluatedAtMs: number;
}
