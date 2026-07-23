/**
 * PR7.1: Health History Data Model
 * Core interface definitions for historical health tracking, timelines, and reporting.
 */

export type HealthRecordBucket = "DAILY" | "WEEKLY" | "MONTHLY";

export interface HealthMetricBounds {
    min: number;
    max: number;
    average: number;
}

export interface VitalSignSummary {
    heartRate: HealthMetricBounds;
    spO2: HealthMetricBounds;
    restingHeartRate: number;
}

export interface ActivitySummary {
    totalSteps: number;
    activeMinutes: number;
    estimatedCaloriesBurned: number;
}

export interface DailyHealthRecord {
    id: string; // userId_DAILY_YYYY-MM-DD
    userId: string;
    dateIso: string; // YYYY-MM-DD
    vitals: VitalSignSummary;
    activity: ActivitySummary;
    anomalyCount: number;
    stressScore: number; // 0.0 to 1.0
    recoveryScore: number; // 0.0 to 100.0
    dataQualityRatio: number; // 0.0 to 1.0
    updatedAt: number;
}

export interface WeeklyHealthRecord {
    id: string; // userId_WEEKLY_YYYY-Www
    userId: string;
    weekIdentifier: string; // e.g. "2026-W30"
    startDateIso: string;
    endDateIso: string;
    avgRestingHeartRate: number;
    avgSpO2: number;
    totalStepCount: number;
    avgDailyStepCount: number;
    totalAnomalies: number;
    healthScore: number; // 0.0 to 100.0
    updatedAt: number;
}

export interface MonthlyHealthRecord {
    id: string; // userId_MONTHLY_YYYY-MM
    userId: string;
    monthIdentifier: string; // e.g. "2026-07"
    startDateIso: string;
    endDateIso: string;
    avgRestingHeartRate: number;
    avgSpO2: number;
    totalStepCount: number;
    totalAnomalies: number;
    dominantContext: string;
    updatedAt: number;
}

export type TimelineEventType = "ANOMALY_ALERT" | "WORKOUT_SESSION" | "RECOVERY_MILESTONE" | "BASELINE_SHIFT";

export interface HealthTimelineEvent {
    id: string;
    userId: string;
    timestamp: number;
    type: TimelineEventType;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    title: string;
    description: string;
    metadata: Record<string, any>;
}

export interface HealthReportPayload {
    reportId: string;
    userId: string;
    generatedAt: number;
    timeframe: {
        startDateIso: string;
        endDateIso: string;
    };
    summary: {
        avgRestingHeartRate: number;
        avgSpO2: number;
        totalSteps: number;
        totalAnomalies: number;
    };
    trends: {
        heartRateTrajectory: string;
        activityTrajectory: string;
    };
    clinicalNotes: string[];
}

export interface PrivacyExportConfig {
    userId: string;
    includeVitals: boolean;
    includeActivity: boolean;
    includeAnomalies: boolean;
    anonymizeUserId: boolean;
}
