/**
 * PR7.2: Daily Health Record Manager Verification & Unit Tests
 */

import { DailyRecordManager } from "../services/dailyRecordManager";
import { AnalyticsRecord } from "../types/analytics";

export async function runPR72Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.2 DAILY HEALTH RECORD MANAGER TESTS ");
    console.log("==================================================");

    const manager = new DailyRecordManager();
    const testUserId = "TEST_USER_PR7_2";
    const dateIso = "2026-07-24";

    const mockAnalyticsRecord: AnalyticsRecord = {
        id: `${testUserId}_DAILY_${dateIso}`,
        userId: testUserId,
        bucketType: "DAILY",
        windowStartIso: `${dateIso}T00:00:00.000Z`,
        windowEndIso: `${dateIso}T23:59:59.999Z`,
        telemetry: {
            heartRate: { min: 55, max: 150, mean: 75, median: 72, stdDev: 8.5, sampleCount: 1440 },
            spO2: { min: 95, max: 99, mean: 98.0, median: 98, stdDev: 0.6, sampleCount: 1440 },
            accelMagnitude: { min: 9.7, max: 18.2, mean: 10.5, median: 9.8, stdDev: 1.4, sampleCount: 1440 },
            totalStepCount: 10500,
            dataQualityRatio: 0.98
        },
        stability: {
            restingHeartRate: 59.0,
            spO2StabilityScore: 0.95,
            postActivityRecoveryRateBpmPerMin: 24.0,
            stressProxyIndex: 0.12
        },
        primaryContext: "RESTING",
        anomalyCount: 1,
        updatedAt: Date.now()
    };

    try {
        console.log("[TEST 1] Transforming AnalyticsRecord to DailyHealthRecord...");
        const transformedRecord = manager.transformAnalyticsToDailyRecord(mockAnalyticsRecord);

        console.log("  ✓ Transformation successful.");
        console.log(`    - Date: ${transformedRecord.dateIso}`);
        console.log(`    - Total Steps: ${transformedRecord.activity.totalSteps}`);
        console.log(`    - Recovery Score: ${transformedRecord.recoveryScore}/100`);

        if (transformedRecord.activity.totalSteps !== 10500 || transformedRecord.vitals.restingHeartRate !== 59.0) {
            throw new Error("Transformed record field validation failed.");
        }

        console.log("[TEST 2] Saving DailyHealthRecord to IndexedDB...");
        await manager.saveDailyRecord(transformedRecord);

        console.log("[TEST 3] Querying saved record...");
        const retrievedRecord = await manager.getDailyRecord(testUserId, dateIso);

        if (!retrievedRecord) {
            throw new Error("Failed to retrieve saved DailyHealthRecord.");
        }

        console.log("  ✓ Record retrieved successfully.");
        console.log(`    - Retrived ID: ${retrievedRecord.id}`);
        console.log(`    - Estimated Calories: ${retrievedRecord.activity.estimatedCaloriesBurned} kcal`);

        console.log("[TEST 4] Cleaning up test records...");
        await manager.clearUserRecords(testUserId);

        console.log("
✅ ALL PR7.2 DAILY RECORD MANAGER TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR7.2 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR72Tests();
}
