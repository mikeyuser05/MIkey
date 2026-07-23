/**
 * PR6.6: Anomaly Engine Service
 * Multi-metric statistical anomaly detection using dynamic Z-score calculations and quality weighting.
 */

import { TelemetryPayload } from "../types/intelligencePipeline";
import { AnomalyScoreResult, AnomalySeverity, MultiMetricAnomalyAssessment } from "../types/anomaly";

export class AnomalyEngine {
    /**
     * Computes Z-score and evaluates statistical anomaly threshold
     */
    public scoreMetric(
        metric: "HEART_RATE" | "SPO2",
        observedValue: number,
        baselineMean: number,
        baselineStdDev: number,
        dataQualityRatio: number
    ): AnomalyScoreResult {
        const stdDev = Math.max(1.0, baselineStdDev); // Prevent divide-by-zero
        const zScore = (observedValue - baselineMean) / stdDev;
        const absZ = Math.abs(zScore);

        // Apply quality weighting: low quality reduces sensitivity to avoid false alerts
        const weightedScore = parseFloat((absZ * dataQualityRatio).toFixed(2));

        let isAnomaly = false;
        let severity: AnomalySeverity = "LOW";

        if (weightedScore >= 3.5) {
            isAnomaly = true;
            severity = "CRITICAL";
        } else if (weightedScore >= 2.5) {
            isAnomaly = true;
            severity = "HIGH";
        } else if (weightedScore >= 2.0) {
            isAnomaly = true;
            severity = "MEDIUM";
        } else if (weightedScore >= 1.5) {
            severity = "LOW";
        }

        const direction = zScore > 0 ? "elevation" : "drop";
        const explanation = isAnomaly
            ? `Significant ${metric} ${direction} detected (Z-Score: ${zScore.toFixed(2)}, Quality: ${dataQualityRatio}).`
            : `Nominal ${metric} behavior within expected statistical baseline.`;

        return {
            metric,
            observedValue,
            baselineMean,
            baselineStdDev: stdDev,
            zScore: parseFloat(zScore.toFixed(2)),
            weightedScore,
            isAnomaly,
            severity,
            explanation
        };
    }

    /**
     * Assesses multi-metric telemetry event against context baseline
     */
    public evaluateTelemetry(
        telemetry: TelemetryPayload,
        spO2Value: number,
        hrMean: number,
        hrStdDev: number,
        spO2Mean: number,
        spO2StdDev: number,
        dataQualityRatio: number
    ): MultiMetricAnomalyAssessment {
        const hrResult = this.scoreMetric("HEART_RATE", telemetry.heartRate, hrMean, hrStdDev, dataQualityRatio);
        const spO2Result = this.scoreMetric("SPO2", spO2Value, spO2Mean, spO2StdDev, dataQualityRatio);

        const isSystemAnomaly = hrResult.isAnomaly || spO2Result.isAnomaly;

        let overallSeverity: AnomalySeverity = "LOW";
        if (hrResult.severity === "CRITICAL" || spO2Result.severity === "CRITICAL") {
            overallSeverity = "CRITICAL";
        } else if (hrResult.severity === "HIGH" || spO2Result.severity === "HIGH") {
            overallSeverity = "HIGH";
        } else if (hrResult.severity === "MEDIUM" || spO2Result.severity === "MEDIUM") {
            overallSeverity = "MEDIUM";
        }

        return {
            userId: telemetry.userId,
            timestamp: telemetry.timestamp,
            heartRateAssessment: hrResult,
            spO2Assessment: spO2Result,
            overallSeverity,
            isSystemAnomaly,
            dataQualityRatio
        };
    }
}
