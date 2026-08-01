/**
 * PR6.5: Stability & Recovery Verification & Unit Tests
 */

import { RecoveryEvaluator } from "../services/recoveryEvaluator";
import { TelemetryPayload } from "../types/intelligencePipeline";

export async function runPR65Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.5 STABILITY & RECOVERY TESTS        ");
    console.log("==================================================");

    const evaluator = new RecoveryEvaluator();
    const testUserId = "TEST_USER_PR6_5";
    const now = Date.now();

    // 1. Peak exercise telemetry (155 BPM)
    const peakTelemetry: TelemetryPayload = {
        userId: testUserId,
        timestamp: now,
        heartRate: 155,
        accelMagnitude: 16.5,
        stepCount: 50,
        hourOfDay: 17
    };

    // 2. Recovery telemetry 120 seconds later (105 BPM) -> 50 BPM drop over 2 min = 25 BPM/min
    const recoveryTelemetry: TelemetryPayload = {
        userId: testUserId,
        timestamp: now + 120000,
        heartRate: 105,
        accelMagnitude: 9.8,
        stepCount: 0,
        hourOfDay: 17
    };

    // 3. SpO2 telemetry readings (simulating stable oxygen levels)
    const stableSpO2 = [98, 98, 99, 97, 98, 98, 99, 98];

    try {
        console.log("[TEST 1] Testing Heart Rate Recovery Evaluation...");
        const recoveryResult = evaluator.evaluateHeartRateRecovery(peakTelemetry, recoveryTelemetry);

        console.log("  ✓ HR Recovery Calculated.");
        console.log(`    - Drop: ${recoveryResult.recoveryDropBpm} BPM in ${recoveryResult.timeElapsedSeconds}s`);
        console.log(`    - Rate: ${recoveryResult.recoveryRateBpmPerMin} BPM/min`);
        console.log(`    - Quality: ${recoveryResult.recoveryQuality}`);

        if (recoveryResult.recoveryRateBpmPerMin !== 25.0) {
            throw new Error(`Expected recovery rate of 25.0 BPM/min, got ${recoveryResult.recoveryRateBpmPerMin}`);
        }
        if (recoveryResult.recoveryQuality !== "EXCELLENT") {
            throw new Error(`Expected EXCELLENT recovery quality, got ${recoveryResult.recoveryQuality}`);
        }

        console.log("[TEST 2] Testing SpO2 Stability Evaluation...");
        const spO2Result = evaluator.evaluateSpO2Stability(stableSpO2);

        console.log("  ✓ SpO2 Stability Calculated.");
        console.log(`    - Mean SpO2: ${spO2Result.meanSpO2}%`);
        console.log(`    - Stability Score: ${spO2Result.stabilityScore}`);
        console.log(`    - Hypoxic Dips (<95%): ${spO2Result.hypoxicDipCount}`);

        if (!spO2Result.isStable) {
            throw new Error("Expected SpO2 profile to be marked as stable.");
        }

        console.log("[TEST 3] Generating Comprehensive Stability Profile...");
        const profile = evaluator.computeStabilityProfile(
            testUserId,
            peakTelemetry,
            recoveryTelemetry,
            stableSpO2,
            65 // Resting baseline BPM
        );

        console.log("  ✓ Profile Generated.");
        console.log(`    - Stress Proxy Index: ${profile.stressProxyIndex}`);

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR6.5 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR65Tests();
}
