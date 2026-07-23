/**
 * PR6.7: Export Engine Verification & Unit Tests
 */

import { ExportEngine } from "../services/exportEngine";
import { AnalyticsStorageService } from "../services/analyticsStorage";
import { AnalyticsRecord } from "../types/analytics";

export async function runPR67Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.7 ANALYTICS EXPORT ENGINE TESTS     ");
    console.log("==================================================");

    const storage = new AnalyticsStorageService();
    const exportEngine = new ExportEngine();
    const testUserId = "TEST_USER_PR6_7";

    const mockRecord: AnalyticsRecord = {
        id: `${testUserId}_DAILY_2026-07-01`,
        userId: testUserId,
        bucketType: "DAILY",
        windowStartIso: "2026-07-01T00:00:00.000Z",
        windowEndIso: "2026-07-01T23:59:59.999Z",
        telemetry: {
            heartRate: { min: 60, max: 140, mean: 75, median: 73, stdDev: 6.5, sampleCount: 1440 },
            spO2: { min: 96, max: 99, mean: 98.1, median: 98, stdDev: 0.4, sampleCount: 1440 },
            accelMagnitude: { min: 9.7, max: 15.0, mean: 10.1, median: 9.8, stdDev: 1.1, sampleCount: 1440 },
            totalStepCount: 9500,
            dataQualityRatio: 0.98
        },
        stability: {
            restingHeartRate: 62.0,
            spO2StabilityScore: 0.96,
            postActivityRecoveryRateBpmPerMin: 22.0,
            stressProxyIndex: 0.15
        },
        primaryContext: "RESTING",
        anomalyCount: 0,
        updatedAt: Date.now()
    };

    try {
        console.log("[TEST 1] Seeding record into IndexedDB...");
        await storage.saveRecord(mockRecord);

        console.log("[TEST 2] Testing JSON Export Generation...");
        const jsonExport = await exportEngine.exportRecords({
            userId: testUserId,
            bucketType: "DAILY",
            format: "JSON"
        });

        console.log("  ✓ JSON Export Generated.");
        console.log(`    - File Name: ${jsonExport.fileName}`);
        console.log(`    - Record Count: ${jsonExport.recordCount}`);

        if (jsonExport.recordCount !== 1 || !jsonExport.content.includes("2026-07-01")) {
            throw new Error("JSON export content validation failed.");
        }

        console.log("[TEST 3] Testing CSV Export Generation...");
        const csvExport = await exportEngine.exportRecords({
            userId: testUserId,
            bucketType: "DAILY",
            format: "CSV"
        });

        console.log("  ✓ CSV Export Generated.");
        console.log(`    - File Name: ${csvExport.fileName}`);
        console.log(`    - Line Count: ${csvExport.content.split("\n").length}`);

        if (csvExport.recordCount !== 1 || !csvExport.content.includes('"hr_min","hr_max"')) {
            throw new Error("CSV export header validation failed.");
        }

        console.log("[TEST 4] Cleaning up test records...");
        await storage.clearUserAnalytics(testUserId);

        console.log("
✅ ALL PR6.7 EXPORT ENGINE TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR6.7 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR67Tests();
}
