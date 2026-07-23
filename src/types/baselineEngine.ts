/**
 * @file baselineEngine.ts
 * @description Domain types for baseline data buffering, empirical calculation, and confidence scoring.
 */

export interface SampleReading {
  timestampMs: number;
  heartRate: number;
  spO2: number;
}

export interface EmpiricBaselineResult {
  empiricalRHR: number;
  empiricalSpO2: number;
  hrStdDev: number;
  spO2StdDev: number;
  sampleCount: number;
  confidenceScore: number;
  isCalibrated: boolean;
  lastUpdatedIso: string;
}
