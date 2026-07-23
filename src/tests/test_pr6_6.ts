/**
 * PR6.6: Anomaly Engine Verification & Unit Tests
 */

import { AnomalyEngine } from "../services/anomalyEngine";
import { TelemetryPayload } from "../types/intelligencePipeline";

export async function runPR66Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.6 ANOMALY SCORING ENGINE TESTS      ");
    console.log("==================================================");

    const engine = new AnomalyEngine();
    const testUserId = "TEST_USER_PR6_6";

    const hrBaselineMean = 70;
    const hrBaselineStdDev = 5;
    const spO2BaselineMean = 98;
    const spO2BaselineStdDev = 1;

    // Nominal Telemetry (72 BPM, 98% SpO2)
    const nominalTelemetry: TelemetryPayload = {
        userId: testUserId,
        timestamp: Date.now(),
        heartRate: 72,
        accelMagnitude: 9.8,
        stepCount: 0,
        hourOfDay: 14
    };

    // Acute Resting HR Spike Telemetry (115 BPM resting -> Z-Score = 9.0)
    const spikeTelemetry: TelemetryPayload = {
        userId: testUserId,
        timestamp: Date.now(),
        heartRate: 115,
        accelMagnitude: 9.8,
        stepCount: 0,
        hourOfDay: 14
    };

    try {
        console.log("[TEST 1] Testing Nominal Telemetry Evaluation...");
        const nominalEval = engine.evaluateTelemetry(
            nominalTelemetry,
            98,
            hrBaselineMean,
            hrBaselineStdDev,
            spO2BaselineMean,
            spO2BaselineStdDev,
            1.0
        );

        console.log("  ✓ Nominal Evaluation Complete.");
        console.log(`    - System Anomaly: ${nominalEval.isSystemAnomaly ? "YES" : "NO"}`);
        console.log(`    - HR Z-Score: ${nominalEval.heartRateAssessment.zScore}`);

        if (nominalEval.isSystemAnomaly) {
            throw new Error("Nominal telemetry falsely flagged as anomaly.");
        }

        console.log("[TEST 2] Testing Acute Resting HR Spike Anomaly...");
        const spikeEval = engine.evaluateTelemetry(
            spikeTelemetry,
            98,
            hrBaselineMean,
            hrBaselineStdDev,
            spO2BaselineMean,
            spO2BaselineStdDev,
            1.0
        );

        console.log("  ✓ HR Spike Evaluation Complete.");
        console.log(`    - System Anomaly: ${spikeEval.isSystemAnomaly ? "YES" : "NO"}`);
        console.log(`    - Overall Severity: ${spikeEval.overallSeverity}`);
        console.log(`    - HR Z-Score: ${spikeEval.heartRateAssessment.zScore}`);

        if (!spikeEval.isSystemAnomaly || spikeEval.overallSeverity !== "CRITICAL") {
            throw new Error("Acute HR spike failed to trigger CRITICAL system anomaly.");
        }

        console.log("[TEST 3] Testing Low Data Quality Filtering...");
        const lowQualitySpikeEval = engine.evaluateTelemetry(
            spikeTelemetry,
            98,
            hrBaselineMean,
            hrBaselineStdDev,
            spO2BaselineMean,
            spO2BaselineStdDev,
            0.2 // Low quality ratio
        );

        console.log("  ✓ Low Quality Evaluation Complete.");
        console.log(`    - Weighted Score: ${lowQualitySpikeEval.heartRateAssessment.weightedScore}`);
        console.log(`    - Overall Severity: ${lowQualitySpikeEval.overallSeverity}`);

        if (lowQualitySpikeEval.heartRateAssessment.weightedScore >= 3.5) {
            throw new Error("Quality weighting failed to suppress low-quality sensor spike.");
        }

        console.log("
✅ ALL PR6.6 ANOMALY SCORING TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR6.6 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR66Tests();
}
