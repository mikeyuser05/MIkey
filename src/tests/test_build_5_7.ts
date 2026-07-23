/**
 * Build 5.7 Verification & Final PR5 Integration Test
 */

import { IntelligenceOrchestrator } from "../services/intelligenceOrchestrator";
import { TelemetryPayload } from "../types/intelligencePipeline";

function runBuild57IntegrationTests() {
    console.log("=== RUNNING BUILD 5.7 INTEGRATION TESTS ===");
    const orchestrator = new IntelligenceOrchestrator();

    // Sample Active Telemetry Event (User exercising, HR 145)
    const workoutTelemetry: TelemetryPayload = {
        userId: "USER_NOEXCUSE_01",
        timestamp: Date.now(),
        heartRate: 145,
        accelMagnitude: 14.8,
        stepCount: 22,
        hourOfDay: 16
    };

    const output1 = orchestrator.processTelemetry(workoutTelemetry);
    console.log("[TEST 1 - ACTIVE PIPELINE]");
    console.log(`  State Detected: ${output1.contextState}`);
    console.log(`  Dynamic Target Range: [${output1.baseline.dynamicMinBpm.toFixed(1)} - ${output1.baseline.dynamicMaxBpm.toFixed(1)}] BPM`);
    console.log(`  Anomaly Status: ${output1.assessment.isAnomaly ? "YES (FAIL)" : "NO (PASS)"}`);
    console.log(`  Severity: ${output1.assessment.severity}
`);

    // Sample Resting Anomaly Event (User resting, unexpected spike to 135 BPM)
    const restingSpikeTelemetry: TelemetryPayload = {
        userId: "USER_NOEXCUSE_01",
        timestamp: Date.now(),
        heartRate: 135,
        accelMagnitude: 9.8,
        stepCount: 0,
        hourOfDay: 14
    };

    const output2 = orchestrator.processTelemetry(restingSpikeTelemetry);
    console.log("[TEST 2 - RESTING ANOMALY PIPELINE]");
    console.log(`  State Detected: ${output2.contextState}`);
    console.log(`  Dynamic Target Range: [${output2.baseline.dynamicMinBpm.toFixed(1)} - ${output2.baseline.dynamicMaxBpm.toFixed(1)}] BPM`);
    console.log(`  Anomaly Status: ${output2.assessment.isAnomaly ? "YES (PASS)" : "NO (FAIL)"}`);
    console.log(`  Severity: ${output2.assessment.severity} (Score: ${output2.assessment.deviationScore})`);
}

runBuild57IntegrationTests();
