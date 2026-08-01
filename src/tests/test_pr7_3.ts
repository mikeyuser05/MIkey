/**
 * PR7.3: Weekly Health Record Manager Verification & Unit Tests
 */

import { WeeklyRecordManager } from "../services/weeklyRecordManager";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPR73Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.3 WEEKLY HEALTH RECORD MANAGER TESTS");
    console.log("==================================================");

    const manager = new WeeklyRecordManager();
    const testUserId = "TEST_USER_PR7_3";
    const weekIdentifier = "2026-W30";

    // Generate 7 days of daily health records
    const mockDailyRecords: DailyHealthRecord[] = [];
    for (let i = 0; i < 7; i++) {
        const dayStr = i < 9 ? `0${i + 1}` : `${i + 1}`;
        mockDailyRecords.push({
            id: `${testUserId}_DAILY_2026-07-${dayStr}`,
            userId: testUserId,
            dateIso: `2026-07-${dayStr}`,
            vitals: {
                heartRate: { min: 60, max: 140, average: 75 },
                spO2: { min: 96, max: 99, average: 98.0 },
                restingHeartRate: 60 + (i % 2) // Alternating 60/61
            },
            activity: {
                totalSteps: 8000 + i * 500, // 8000 to 11000
                activeMinutes: 40 + i * 5,
                estimatedCaloriesBurned: 400
            },
            anomalyCount: i === 3 ? 1 : 0, // Single anomaly on day 4
            stressScore: 0.15,
            recoveryScore: 85.0,
            dataQualityRatio: 0.98,
            updatedAt: Date.now()
        });
    }

    try {
        console.log("[TEST 1] Aggregating 7 Daily Health Records into Weekly Record...");
        const weeklyRecord = manager.aggregateWeeklyRecord(testUserId, weekIdentifier, mockDailyRecords);

        console.log("  ✓ Weekly record aggregated successfully.");
        console.log(`    - Week Identifier: ${weeklyRecord.weekIdentifier}`);
        console.log(`    - Date Range: ${weeklyRecord.startDateIso} to ${weeklyRecord.endDateIso}`);
        console.log(`    - Total Steps: ${weeklyRecord.totalStepCount}`);
        console.log(`    - Avg Daily Steps: ${weeklyRecord.avgDailyStepCount}`);
        console.log(`    - Composite Health Score: ${weeklyRecord.healthScore}/100`);

        if (weeklyRecord.totalStepCount !== 66500 || weeklyRecord.totalAnomalies !== 1) {
            throw new Error("Weekly aggregation metrics validation failed.");
        }

        console.log("[TEST 2] Saving WeeklyHealthRecord to IndexedDB...");
        await manager.saveWeeklyRecord(weeklyRecord);

        console.log("[TEST 3] Querying saved WeeklyHealthRecord...");
        const retrieved = await manager.getWeeklyRecord(testUserId, weekIdentifier);

        if (!retrieved) {
            throw new Error("Failed to retrieve saved WeeklyHealthRecord.");
        }

        console.log("  ✓ Weekly record retrieved successfully.");
        console.log(`    - Retrived ID: ${retrieved.id}`);

        console.log("[TEST 4] Cleaning up test records...");
        await manager.clearUserRecords(testUserId);

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR7.3 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR73Tests();
}
