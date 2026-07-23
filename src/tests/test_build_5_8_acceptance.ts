/**
 * Build 5.8: Acceptance & Regression Verification Suite
 * Validates PR5 end-to-end functionality before freezing for PR6 transition.
 */

import { PR5HealthIntelligenceModule } from "../services/pr5HealthIntelligenceModule";
import { TelemetryPayload } from "../types/intelligencePipeline";

function runAcceptanceSuite() {
    console.log("==================================================");
    console.log("  BUILD 5.8: PR5 SYSTEM ACCEPTANCE & FREEZE TEST  ");
    console.log("==================================================
");

    const pr5Module = new PR5HealthIntelligenceModule();

    if (!pr5Module.isModuleReady()) {
        console.error("❌ ERROR: PR5 Module failed to initialize frozen state.");
        process.exit(1);
    }

    let passCount = 0;
    let failCount = 0;

    // Test Scenarios
    const scenarios: Array<{ name: string; payload: TelemetryPayload; expectedState: string; expectedAnomaly: boolean }> = [
        {
            name: "Normal Resting Baseline",
            payload: { userId: "U1", timestamp: Date.now(), heartRate: 72, accelMagnitude: 9.81, stepCount: 0, hourOfDay: 14 },
            expectedState: "RESTING",
            expectedAnomaly: false
        },
        {
            name: "Active Exercise - Dynamic Range Extension",
            payload: { userId: "U1", timestamp: Date.now(), heartRate: 155, accelMagnitude: 16.5, stepCount: 40, hourOfDay: 17 },
            expectedState: "ACTIVE",
            expectedAnomaly: false
        },
        {
            name: "Sleep State - Normal Low HR",
            payload: { userId: "U1", timestamp: Date.now(), heartRate: 52, accelMagnitude: 9.78, stepCount: 0, hourOfDay: 3 },
            expectedState: "SLEEPING",
            expectedAnomaly: false
        },
        {
            name: "Resting Critical Anomaly Spike",
            payload: { userId: "U1", timestamp: Date.now(), heartRate: 160, accelMagnitude: 9.8, stepCount: 0, hourOfDay: 11 },
            expectedState: "RESTING",
            expectedAnomaly: true
        }
    ];

    scenarios.forEach((test, idx) => {
        const result = pr5Module.analyzeTelemetry(test.payload);
        const statePassed = result.contextState === test.expectedState;
        const anomalyPassed = result.assessment.isAnomaly === test.expectedAnomaly;

        if (statePassed && anomalyPassed) {
            console.log(`[PASS] Test ${idx + 1}: ${test.name}`);
            console.log(`       State: ${result.contextState} | Anomaly: ${result.assessment.isAnomaly} | Severity: ${result.assessment.severity}`);
            passCount++;
        } else {
            console.log(`[FAIL] Test ${idx + 1}: ${test.name}`);
            console.log(`       Expected State: ${test.expectedState}, Got: ${result.contextState}`);
            console.log(`       Expected Anomaly: ${test.expectedAnomaly}, Got: ${result.assessment.isAnomaly}`);
            failCount++;
        }
    });

    console.log("
--------------------------------------------------");
    console.log(` Acceptance Results: ${passCount}/${scenarios.length} Passed.`);
    if (failCount === 0) {
        console.log(" 🎉 PR5 Personal Health Intelligence is FULLY VERIFIED & FROZEN.");
        console.log(" 👉 Ready for PR6 (Advanced Health Analytics) transition.");
    } else {
        console.log(" ⚠️ PR5 Verification failed. Fix regression before freezing.");
    }
    console.log("--------------------------------------------------
");
}

runAcceptanceSuite();
