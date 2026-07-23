/**
 * PR6.4: Trend Engine Service
 * Analyzes time-series AnalyticsRecord items for linear regression slopes and statistical trends.
 */

import { AnalyticsRecord } from "../types/analytics";
import { MetricTrend, MetricType, TrendAnalysisReport, TrendDirection } from "../types/trends";

export class TrendEngine {
    /**
     * Calculates linear regression slope and Pearson correlation coefficient (r)
     */
    private calculateLinearRegression(yValues: number[]): { slope: number; r: number; percentChange: number } {
        const n = yValues.length;
        if (n < 2) {
            return { slope: 0, r: 0, percentChange: 0 };
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;

        for (let x = 0; x < n; x++) {
            const y = yValues[x];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumX2 += x * x;
            sumY2 += y * y;
        }

        const denominator = n * sumX2 - sumX * sumX;
        if (denominator === 0) {
            return { slope: 0, r: 0, percentChange: 0 };
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;

        // Pearson correlation coefficient (r)
        const numR = n * sumXY - sumX * sumY;
        const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        const r = denR !== 0 ? numR / denR : 0;

        const firstVal = yValues[0];
        const lastVal = yValues[n - 1];
        const percentChange = firstVal !== 0 ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100 : 0;

        return {
            slope: parseFloat(slope.toFixed(3)),
            r: parseFloat(r.toFixed(3)),
            percentChange: parseFloat(percentChange.toFixed(2))
        };
    }

    /**
     * Evaluates directionality based on metric semantics
     */
    private evaluateDirection(metric: MetricType, slope: number, percentChange: number): TrendDirection {
        const magnitudeThreshold = 0.05; // Minimum slope to register direction
        if (Math.abs(slope) < magnitudeThreshold && Math.abs(percentChange) < 3.0) {
            return "STABLE";
        }

        switch (metric) {
            case "RESTING_HEART_RATE":
            case "STRESS_INDEX":
                // Lower is better
                return slope < 0 ? "IMPROVING" : "DEGRADING";
            case "SPO2_STABILITY":
            case "TOTAL_STEPS":
                // Higher is better
                return slope > 0 ? "IMPROVING" : "DEGRADING";
            default:
                return "STABLE";
        }
    }

    /**
     * Performs trend detection across a sequence of AnalyticsRecord items sorted by date
     */
    public analyzeTrends(userId: string, records: AnalyticsRecord[]): TrendAnalysisReport {
        if (records.length < 2) {
            throw new Error("Trend analysis requires at least 2 AnalyticsRecord samples.");
        }

        const sorted = [...records].sort((a, b) => a.windowStartIso.localeCompare(b.windowStartIso));

        const rhrSeries = sorted.map((r) => r.stability.restingHeartRate);
        const spO2Series = sorted.map((r) => r.stability.spO2StabilityScore);
        const stepsSeries = sorted.map((r) => r.telemetry.totalStepCount);
        const stressSeries = sorted.map((r) => r.stability.stressProxyIndex);

        const metricsToAnalyze: Array<{ type: MetricType; series: number[]; label: string }> = [
            { type: "RESTING_HEART_RATE", series: rhrSeries, label: "Resting Heart Rate" },
            { type: "SPO2_STABILITY", series: spO2Series, label: "SpO2 Stability Score" },
            { type: "TOTAL_STEPS", series: stepsSeries, label: "Total Daily Steps" },
            { type: "STRESS_INDEX", series: stressSeries, label: "Stress Proxy Index" }
        ];

        const trendsMap: Partial<Record<MetricType, MetricTrend>> = {};
        let degradingCount = 0;
        let improvingCount = 0;

        metricsToAnalyze.forEach(({ type, series, label }) => {
            const reg = this.calculateLinearRegression(series);
            const direction = this.evaluateDirection(type, reg.slope, reg.percentChange);

            if (direction === "DEGRADING") degradingCount++;
            if (direction === "IMPROVING") improvingCount++;

            trendsMap[type] = {
                metric: type,
                direction,
                slope: reg.slope,
                correlationCoefficient: reg.r,
                percentChange: reg.percentChange,
                sampleCount: series.length,
                description: `${label} is ${direction.toLowerCase()} (${reg.percentChange > 0 ? "+" : ""}${reg.percentChange}% change).`
            };
        });

        let overallHealthTrajectory: TrendDirection = "STABLE";
        if (degradingCount > improvingCount) {
            overallHealthTrajectory = "DEGRADING";
        } else if (improvingCount > degradingCount) {
            overallHealthTrajectory = "IMPROVING";
        }

        return {
            userId,
            windowStartIso: sorted[0].windowStartIso,
            windowEndIso: sorted[sorted.length - 1].windowEndIso,
            trends: trendsMap as Record<MetricType, MetricTrend>,
            overallHealthTrajectory,
            generatedAt: Date.now()
        };
    }
}
