/**
 * PR6.6: Anomaly Scoring Domain Types
 */

export type AnomalySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AnomalyScoreResult {
    metric: "HEART_RATE" | "SPO2" | "COMPOSITE";
    observedValue: number;
    baselineMean: number;
    baselineStdDev: number;
    zScore: number;
    weightedScore: number; // Quality-weighted anomaly score (0.0 to 1.0+)
    isAnomaly: boolean;
    severity: AnomalySeverity;
    explanation: string;
}

export interface MultiMetricAnomalyAssessment {
    userId: string;
    timestamp: number;
    heartRateAssessment: AnomalyScoreResult;
    spO2Assessment: AnomalyScoreResult;
    overallSeverity: AnomalySeverity;
    isSystemAnomaly: boolean;
    dataQualityRatio: number;
}
