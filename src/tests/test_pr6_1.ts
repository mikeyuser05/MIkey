/**
 * PR6.1: Verification & Unit Tests
 * Validates Analytics Data Model Structure and Dexie Storage Operations
 */

import { AnalyticsRecord } from "../types/analytics";
import { AnalyticsStorageService } from "../services/analyticsStorage";

export async function runPR61Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.1 ANALYTICS DATA MODEL TESTS       ");
    console.log("==================================================");

    const storage = new AnalyticsStorageService();
    const testUserId = "TEST_USER_PR6_1";

    const mockRecord: AnalyticsRecord = {
        id: `${testUserId}_DAILY_2026-07-23`,
        userId: testUserId,
        bucketType: "DAILY",
        windowStartIso: "2026-07-23T00:00:00.000Z",
        windowEndIso: "2026-07-23T23:59:59.999Z",
        telemetry: {
            heartRate: { min: 58, max: 142, mean: 74.5, median: 72, stdDev: 8.2, sampleCount: 1440 },
            spO2: { min: 96, max: 99, mean: 98.1, median: 98, stdDev: 0.6, sampleCount: 1440 },
            accelMagnitude: { min: 9.7, max: 18.2, mean: 10.1, median: 9.8, stdDev: 1.4, sampleCount: 1440 },
            totalStepCount: 8450,
            dataQualityRatio: 0.985
        },
        stability: {
            restingHeartRate: 61,
            spO2StabilityScore: 0.96,
            postActivityRecoveryRateBpmPerMin: 18.5,
            stressProxyIndex: 0.22
        },
        primaryContext: "RESTING",
        anomalyCount: 1,
        updatedAt: Date.now()
    };

    try {
        console.log("[TEST 1] Saving AnalyticsRecord to Dexie IndexedDB cache...");
        await storage.saveRecord(mockRecord);
        console.log("  ✓ Record saved successfully.");

        console.log("[TEST 2] Retrieving Record by ID...");
        const retrieved = await storage.getRecordById(mockRecord.id);
        if (!retrieved || retrieved.telemetry.totalStepCount !== 8450) {
            throw new Error("Failed to retrieve matching record or payload mismatch.");
        }
        console.log("  ✓ Record retrieved with valid total step count:", retrieved.telemetry.totalStepCount);

        console.log("[TEST 3] Querying Records by User & Bucket...");
        const userRecords = await storage.getRecords(testUserId, "DAILY");
        if (userRecords.length === 0) {
            throw new Error("Query by composite index [userId+bucketType] returned empty result.");
        }
        console.log("  ✓ Composite index query returned record count:", userRecords.length);

        console.log("[TEST 4] Cleaning up test data...");
        const deletedCount = await storage.clearUserAnalytics(testUserId);
        console.log(`  ✓ Cleared ${deletedCount} test record(s).`);

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR6.1 TEST FAILED:", error);
        return false;
    }
}

// Execute tests if called directly
if (require.main === module) {
    runPR61Tests();
}
