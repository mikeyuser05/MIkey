/**
 * NOEXCUSE HPO V2: PR4.3 Trend Analysis Domain Types
 */

import { UserActivity } from '../../activity/types/activity';

export type TrendDirection = 'RISING' | 'FALLING' | 'STABLE' | 'UNKNOWN';

export interface IRollingMetrics {
  heartRate: { min: number; max: number; avg: number };
  spo2: { min: number; max: number; avg: number };
  gas: { min: number; max: number; avg: number };
}

export interface IActivityAccumulation {
  activityDurationsMs: Record<UserActivity, number>;
  totalTrackedTimeMs: number;
}

export interface ITrendVector {
  direction: TrendDirection;
  deltaValue: number;
}

export interface ITrendAnalysisSummary {
  timestamp: number;
  rollingMetrics: IRollingMetrics;
  activityMetrics: IActivityAccumulation;
  trends: {
    heartRate: ITrendVector;
    spo2: ITrendVector;
    gas: ITrendVector;
  };
}

export interface ITrendAnalysisEngine {
  processTrendWindow(
    telemetryHistory: { timestamp: number; heartRate: number; spo2: number; gas: number }[],
    activityHistory: { timestamp: number; currentActivity: UserActivity }[]
  ): ITrendAnalysisSummary;
  reset(): void;
}