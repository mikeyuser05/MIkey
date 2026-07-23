/**
 * NOEXCUSE HPO V2 - Signal Quality Index (SQI) Domain Types
 * Phase PR5.2: Data Quality / SQI Contract
 */

export type SQIQualityGrade = 'EXCELLENT' | 'ACCEPTABLE' | 'DEGRADED' | 'INVALID';

export type SQIFlag =
  | 'VALID'
  | 'MISSING_DATA'
  | 'STALE_DATA'
  | 'IMPOSSIBLE_VALUE'
  | 'PHYSICAL_SPIKE'
  | 'SENSOR_DROPOUT'
  | 'MOTION_DEGRADED'
  | 'UNSTABLE_READING';

export interface MetricQualityResult {
  value: number | null;
  isValid: boolean;
  score: number; // 0.0 (unusable) to 1.0 (perfect)
  flags: SQIFlag[];
}

export interface SQIEvaluationResult {
  timestamp: number;
  overallScore: number; // 0.0 to 1.0
  grade: SQIQualityGrade;
  isUsableForBaselines: boolean; // Must pass minimum SQI threshold (>= 0.70)
  heartRateQuality: MetricQualityResult;
  spo2Quality: MetricQualityResult;
  gasQuality: MetricQualityResult;
  motionQuality: MetricQualityResult;
  summaryReason: string;
}

export interface SQIBoundaryLimits {
  hrMin: number;
  hrMax: number;
  hrMaxDeltaPerSec: number; // Max plausible HR change per second (e.g. 15 bpm/s)
  spo2Min: number;
  spo2Max: number;
  spo2MaxDeltaPerSec: number; // Max plausible SpO2 drop/rise per second (e.g. 5%/s)
  gasMin: number;
  gasMax: number;
  maxStaleAgeMs: number; // Max allowable time since last telemetry packet (e.g. 10000ms)
}
