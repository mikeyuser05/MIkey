/**
 * PR6.5: Recovery Evaluator Service
 * Computes post-exercise heart rate recovery, SpO2 stability scores, and stress proxies.
 */

import { TelemetryPayload } from "../types/intelligencePipeline";
import { ComprehensiveStabilityProfile, PostActivityRecoveryResult, SpO2StabilityAssessment } from "../types/recovery";

export class RecoveryEvaluator {
    /**
     * Computes Post-Activity Heart Rate Recovery Rate (BPM drop per minute)
     */
    public evaluateHeartRateRecovery(
        peakTelemetry: TelemetryPayload,
        recoveryTelemetry: TelemetryPayload
    ): PostActivityRecoveryResult {
        const timeElapsedSeconds = Math.max(1, (recoveryTelemetry.timestamp - peakTelemetry.timestamp) / 1000);
        const dropBpm = peakTelemetry.heartRate - recoveryTelemetry.heartRate;
        const rateBpmPerMin = parseFloat(((dropBpm / timeElapsedSeconds) * 60).toFixed(1));

        let recoveryQuality: "EXCELLENT" | "GOOD" | "SLUGGISH" | "POOR" = "GOOD";
        if (rateBpmPerMin >= 25) {
            recoveryQuality = "EXCELLENT";
        } else if (rateBpmPerMin >= 15) {
            recoveryQuality = "GOOD";
        } else if (rateBpmPerMin >= 10) {
            recoveryQuality = "SLUGGISH";
        } else {
            recoveryQuality = "POOR";
        }

        return {
            peakHeartRate: peakTelemetry.heartRate,
            recoveredHeartRate: recoveryTelemetry.heartRate,
            recoveryDropBpm: Math.max(0, dropBpm),
            timeElapsedSeconds: Math.round(timeElapsedSeconds),
            recoveryRateBpmPerMin: Math.max(0, rateBpmPerMin),
            recoveryQuality
        };
    }

    /**
     * Evaluates SpO2 stability and detects oxygen saturation dips
     */
    public evaluateSpO2Stability(spO2Readings: number[]): SpO2StabilityAssessment {
        if (spO2Readings.length === 0) {
            return {
                stabilityScore: 1.0,
                meanSpO2: 98,
                minimumSpO2: 98,
                hypoxicDipCount: 0,
                isStable: true
            };
        }

        const validReadings = spO2Readings.filter((v) => v >= 70 && v <= 100);
        const minSpO2 = Math.min(...validReadings);
        const sum = validReadings.reduce((acc, v) => acc + v, 0);
        const meanSpO2 = sum / validReadings.length;

        // Variance / StdDev calculation
        const variance = validReadings.reduce((acc, v) => acc + Math.pow(v - meanSpO2, 2), 0) / validReadings.length;
        const stdDev = Math.sqrt(variance);

        const hypoxicDipCount = validReadings.filter((v) => v < 95).length;
        const stabilityScore = parseFloat(Math.max(0, 1.0 - stdDev / 10).toFixed(2));

        return {
            stabilityScore,
            meanSpO2: parseFloat(meanSpO2.toFixed(1)),
            minimumSpO2: minSpO2,
            hypoxicDipCount,
            isStable: stabilityScore >= 0.85 && hypoxicDipCount === 0
        };
    }

    /**
     * Computes holistic physiological stability profile
     */
    public computeStabilityProfile(
        userId: string,
        peakTelemetry: TelemetryPayload,
        recoveryTelemetry: TelemetryPayload,
        spO2Readings: number[],
        restingBaselineBpm: number
    ): ComprehensiveStabilityProfile {
        const recovery = this.evaluateHeartRateRecovery(peakTelemetry, recoveryTelemetry);
        const spO2Assessment = this.evaluateSpO2Stability(spO2Readings);

        // Stress Index calculation based on elevated resting heart rate relative to baseline
        const hrElevatedDelta = Math.max(0, recoveryTelemetry.heartRate - restingBaselineBpm);
        const stressProxyIndex = parseFloat(Math.min(1.0, hrElevatedDelta / 40.0).toFixed(2));

        return {
            userId,
            timestamp: Date.now(),
            recovery,
            spO2Assessment,
            stressProxyIndex
        };
    }
}
