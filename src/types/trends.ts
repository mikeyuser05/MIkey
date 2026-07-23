/**
 * PR6.4: Trend Detection Domain Types
 */

export type TrendDirection = "IMPROVING" | "STABLE" | "DEGRADING";

export type MetricType = "RESTING_HEART_RATE" | "SPO2_STABILITY" | "TOTAL_STEPS" | "STRESS_INDEX";

export interface MetricTrend {
    metric: MetricType;
    direction: TrendDirection;
    slope: number; // Unit change per period
    correlationCoefficient: number; // R-value (-1.0 to 1.0)
    percentChange: number; // Total percent change across window
    sampleCount: number;
    description: string;
}

export interface TrendAnalysisReport {
    userId: string;
    windowStartIso: string;
    windowEndIso: string;
    trends: Record<MetricType, MetricTrend>;
    overallHealthTrajectory: TrendDirection;
    generatedAt: number;
}
