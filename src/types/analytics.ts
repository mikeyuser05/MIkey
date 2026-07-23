/**
 * PR6.1: Analytics Data Model
 * Core Domain Interfaces & Type Definitions for Long-Term Health Analytics
 */

import { UserContextState } from "./contextualBaseline";

export type TimeBucket = "DAILY" | "WEEKLY" | "MONTHLY";

export interface MetricSummary {
    min: number;
    max: number;
    mean: number;
    median: number;
    stdDev: number;
    sampleCount: number;
}

export interface AggregatedTelemetry {
    heartRate: MetricSummary;
    spO2: MetricSummary;
    accelMagnitude: MetricSummary;
    totalStepCount: number;
    dataQualityRatio: number; // 0.0 to 1.0 representing ratio of valid samples
}

export interface StabilityAndRecoveryMetrics {
    restingHeartRate: number;
    spO2StabilityScore: number; // 0.0 (unstable) to 1.0 (highly stable)
    postActivityRecoveryRateBpmPerMin: number;
    stressProxyIndex: number;
}

export interface AnalyticsRecord {
    id: string; // e.g. "USER01_DAILY_2026-07-23"
    userId: string;
    bucketType: TimeBucket;
    windowStartIso: string;
    windowEndIso: string;
    telemetry: AggregatedTelemetry;
    stability: StabilityAndRecoveryMetrics;
    primaryContext: UserContextState;
    anomalyCount: number;
    updatedAt: number;
}
