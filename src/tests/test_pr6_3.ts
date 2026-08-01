/**
 * PR6.3: Weekly and Monthly Aggregation Verification & Unit Tests
 */

import { MultiPeriodAggregatorService } from "../services/multiPeriodAggregator";
import { AnalyticsStorageService } from "../services/analyticsStorage";
import { AnalyticsRecord } from "../types/analytics";

export async function runPR63Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.3 MULTI-PERIOD AGGREGATION TESTS    ");
    console.log("==================================================");

    const storage = new AnalyticsStorageService();
    const aggregator = new MultiPeriodAggregatorService();
    const testUserId = "TEST_USER_PR6_3";

    // Create 30 days of synthetic daily records
    const mockDailyRecords: AnalyticsRecord[] = [];
    for (let day = 1; day <= 30; day++) {
        const dayStr = day < 10 ? `0${day}` : `${day}`;
        const dateIso = `2026-07-${dayStr}`;

        mockDailyRecords.push({
            id: `${testUserId}_DAILY_${dateIso}`,
            userId: testUserId,
            bucketType: "DAILY",
            windowStartIso: `${dateIso}T00:00:00.000Z`,
            windowEndIso: `${dateIso}T23:59:59.999Z`,
            telemetry: {
                heartRate: { min: 58, max: 145, mean: 72 + (day % 3), median: 71, stdDev: 8.0, sampleCount: 1440 },
                spO2: { min: 96, max: 99, mean: 98.2, median: 98, stdDev: 0.5, sampleCount: 1440 },
                accelMagnitude: { min: 9.7, max: 16.0, mean: 10.2, median: 9.8, stdDev: 1.2, sampleCount: 1440 },
                totalStepCount: 8000 + (day * 100),
                dataQualityRatio: 0.99
            },
            stability: {
                restingHeartRate: 60 + (day % 2),
                spO2StabilityScore: 0.97,
                postActivityRecoveryRateBpmPerMin: 18.0,
                stressProxyIndex: 0.2
            },
            primaryContext: "RESTING",
            anomalyCount: day % 5 === 0 ? 1 : 0,
            updatedAt: Date.now()
        });
    }

    try {
        console.log("[TEST 1] Seeding 30 daily records into IndexedDB...");
        for (const record of mockDailyRecords) {
            await storage.saveRecord(record);
        }
        console.log("  ✓ 30 daily records seeded successfully.");

        console.log("[TEST 2] Running WEEKLY aggregation...");
        const weeklyRecords = mockDailyRecords.slice(0, 7);
        const weeklyResult = aggregator.aggregateDailyRecords(testUserId, "WEEKLY", "2026-W30", weeklyRecords);
        await storage.saveRecord(weeklyResult);

        console.log("  ✓ Weekly Aggregation Complete.");
        console.log(`    - Total Steps (7 Days): ${weeklyResult.telemetry.totalStepCount}`);
        console.log(`    - Combined HR Sample Count: ${weeklyResult.telemetry.heartRate.sampleCount}`);
        console.log(`    - Average Resting HR: ${weeklyResult.stability.restingHeartRate} BPM`);

        if (weeklyResult.telemetry.totalStepCount !== 58800) {
            throw new Error(`Weekly step sum mismatch: got ${weeklyResult.telemetry.totalStepCount}, expected 58800.`);
        }

        console.log("[TEST 3] Running MONTHLY aggregation...");
        const monthlyResult = await aggregator.generateAndSaveMultiPeriodRecord(testUserId, "MONTHLY", "2026-07");

        console.log("  ✓ Monthly Aggregation Complete.");
        console.log(`    - Total Steps (30 Days): ${monthlyResult.telemetry.totalStepCount}`);
        console.log(`    - Total Anomaly Count: ${monthlyResult.anomalyCount}`);
        console.log(`    - Combined Data Quality Ratio: ${monthlyResult.telemetry.dataQualityRatio}`);

        if (monthlyResult.anomalyCount !== 6) {
            throw new Error(`Monthly anomaly sum mismatch: got ${monthlyResult.anomalyCount}, expected 6.`);
        }

        console.log("[TEST 4] Cleaning up test records...");
        await storage.clearUserAnalytics(testUserId);
        console.log("  ✓ Test data cleared.");

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR6.3 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR63Tests();
}
