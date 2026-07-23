/**
 * Build 5.6 Verification & Subphase Unit Test
 */

import { BaselineEngine } from "../services/baselineEngine";

function runBuild56Tests() {
    console.log("=== RUNNING BUILD 5.6 UNIT TESTS ===");
    const engine = new BaselineEngine(60.0, 100.0);

    // Test 1: Active state
    const activeData = { accelMagnitude: 15.2, hourOfDay: 14, stepCount: 25 };
    const activeBaseline = engine.calculateDynamicBaseline(activeData);
    const activeAnomaly = engine.isAnomaly(140.0, activeBaseline);
    console.log(`[TEST 1 - ACTIVE] State: ${activeBaseline.state} | Dynamic Max: ${activeBaseline.dynamicMaxBpm} BPM | Anomaly @ 140 BPM: ${activeAnomaly ? "FAIL" : "PASS"}`);

    // Test 2: Sleeping state
    const sleepData = { accelMagnitude: 9.8, hourOfDay: 2, stepCount: 0 };
    const sleepBaseline = engine.calculateDynamicBaseline(sleepData);
    const sleepAnomaly = engine.isAnomaly(48.0, sleepBaseline);
    console.log(`[TEST 2 - SLEEP]  State: ${sleepBaseline.state} | Dynamic Min: ${sleepBaseline.dynamicMinBpm} BPM | Anomaly @ 48 BPM:  ${sleepAnomaly ? "FAIL" : "PASS"}`);
}

runBuild56Tests();
