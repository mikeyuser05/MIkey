/**
 * PR6.2: Daily Aggregation Verification & Integration Tests
 */

import { DailyAggregatorService } from "../services/dailyAggregator";
import { TelemetryPayload } from "../types/intelligencePipeline";
import { AnalyticsStorageService } from "../services/analyticsStorage";

export async function runPR62Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.2 DAILY AGGREGATION TESTS           ");
    console.log("==================================================");

    const aggregator = new DailyAggregatorService();
    const storage = new AnalyticsStorageService();
    const testUserId = "TEST_USER_PR6_2";
    const testDate = "2026-07-23";

    // Synthetic daily dataset (1,440 telemetry ticks)
    const mockTelemetry: TelemetryPayload[] = [];
    for (let i = 0; i < 1440; i++) {
        const hour = Math.floor(i / 60);
        let hr = 65;
        let accel = 9.81;
        let steps = 0;

        if (hour >= 0 && hour < 6) {
            // Sleep period
            hr = 55 + (i % 5);
            accel = 9.78;
        } else if (hour === 17) {
            // Exercise period
            hr = 140 + (i % 25);
            accel = 15.2;
            steps = 10;
        } else {
            // General waking state
            hr = 70 + (i % 15);
            accel = 9.85;
            steps = 2;
        }

        mockTelemetry.push({
            userId: testUserId,
            timestamp: Date.now() - (1440 - i) * 60000,
            heartRate: hr,
            accelMagnitude: accel,
            stepCount: steps,
            hourOfDay: hour
        });
    }

    // Add 10 noise/corrupted telemetry points to verify filter & data quality ratio
    for (let j = 0; j < 10; j++) {
        mockTelemetry.push({
            userId: testUserId,
            timestamp: Date.now(),
            heartRate: 350, // Invalid extreme value
            accelMagnitude: -5, // Invalid accel
            stepCount: 0,
            hourOfDay: 12
        });
    }

    try {
        console.log("[TEST 1] Aggregating 1,450 raw telemetry samples into daily rollup...");
        const record = await aggregator.generateAndSaveDailyRecord(testUserId, testDate, mockTelemetry);

        console.log("  ✓ Aggregation Complete.");
        console.log(`    - Data Quality Ratio: ${record.telemetry.dataQualityRatio} (Expected ~0.993)`);
        console.log(`    - Heart Rate Mean: ${record.telemetry.heartRate.mean} BPM (Min: ${record.telemetry.heartRate.min}, Max: ${record.telemetry.heartRate.max})`);
        console.log(`    - Resting Heart Rate Extracted: ${record.stability.restingHeartRate} BPM`);
        console.log(`    - Total Steps Aggregated: ${record.telemetry.totalStepCount}`);

        if (record.telemetry.dataQualityRatio >= 1.0) {
            throw new Error("Data quality ratio failed to filter corrupted readings.");
        }

        console.log("[TEST 2] Verifying Dexie Storage Retrieval...");
        const retrieved = await storage.getRecordById(record.id);
        if (!retrieved || retrieved.telemetry.heartRate.sampleCount !== 1440) {
            throw new Error("Failed to verify aggregated record in local IndexedDB storage.");
        }
        console.log("  ✓ Verified record stored in IndexedDB with 1,440 valid samples.");

        console.log("[TEST 3] Cleaning up test records...");
        await storage.clearUserAnalytics(testUserId);
        console.log("  ✓ Test data cleared.");

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR6.2 TEST FAILED:", error);
        return false;
    }
}

// Execute tests if called directly
if (require.main === module) {
    runPR62Tests();
}
