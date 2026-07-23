/**
 * NOEXCUSE HPO V2 - Short-Term Trend Types
 * Phase PR6.2: Short-Term Trend & Acceleration Analysis Engine
 */

export type MetricTrendTrajectory = 'STABLE' | 'RISING_FAST' | 'RISING_SLOW' | 'DROPPING_FAST' | 'DROPPING_SLOW';

export interface MetricKinematics {
  metricName: string;
  currentValue: number;
  velocityPerMinute: number;     // Rate of change per minute (1st derivative)
  accelerationPerMinute: number; // Rate of velocity change per minute (2nd derivative)
  trajectory: MetricTrendTrajectory;
  isRapidExcursion: boolean;
}

export interface ShortTermTrendResult {
  timestamp: number;
  userId: string;
  windowSizeSeconds: number;
  heartRateTrend: MetricKinematics;
  spo2Trend: MetricKinematics;
  gasTrend: MetricKinematics;
  hasRapidKinematicExcursion: boolean;
}
