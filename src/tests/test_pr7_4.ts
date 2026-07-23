/**
 * PR7.4: Monthly Health Record Manager Verification & Unit Tests
 */

import { MonthlyRecordManager } from "../services/monthlyRecordManager";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPR74Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.4 MONTHLY HEALTH RECORD MANAGER TESTS");
    console.log("==================================================");

    const manager = new MonthlyRecordManager();
    const testUserId = "TEST_USER_PR7_4";
    const monthIdentifier = "2026-07";

    // Generate 30 days of daily health records
    const mockDailyRecords: DailyHealthRecord[] = [];
    for (let i = 1; i <= 30; i++) {
        const dayStr = i < 10 ? `0${i}` : `${i}`;
        mockDailyRecords.push({
            id: `${testUserId}_DAILY_2026-07-${dayStr}`,
            userId: testUserId,
            dateIso: `2026-07-${dayStr}`,
            vitals: {
                heartRate: { min: 58, max: 145, average: 74 },
                spO2: { min: 96, max: 99, average: 98.2 },
                restingHeartRate: 60.0
            },
            activity: {
                totalSteps: 8500,
                activeMinutes: 42,
                estimatedCaloriesBurned: 420
            },
            anomalyCount: i % 10 === 0 ? 1 : 0, // 3 anomalies total across 30 days
            stressScore: 0.14,
            recoveryScore: 88.0,
            dataQualityRatio: 0.99,
            updatedAt: Date.now()
        });
    }

    try {
        console.log("[TEST 1] Aggregating 30 Daily Health Records into Monthly Record...");
        const monthlyRecord = manager.aggregateMonthlyRecord(testUserId, monthIdentifier, mockDailyRecords);

        console.log("  ✓ Monthly record aggregated successfully.");
        console.log(`    - Month Identifier: ${monthlyRecord.monthIdentifier}`);
        console.log(`    - Date Range: ${monthlyRecord.startDateIso} to ${monthlyRecord.endDateIso}`);
        console.log(`    - Total Steps: ${monthlyRecord.totalStepCount}`);
        console.log(`    - Total Anomalies: ${monthlyRecord.totalAnomalies}`);
        console.log(`    - Dominant Context: ${monthlyRecord.dominantContext}`);

        if (monthlyRecord.totalStepCount !== 255000 || monthlyRecord.totalAnomalies !== 3) {
            throw new Error("Monthly aggregation metrics validation failed.");
        }

        console.log("[TEST 2] Saving MonthlyHealthRecord to IndexedDB...");
        await manager.saveMonthlyRecord(monthlyRecord);

        console.log("[TEST 3] Querying saved MonthlyHealthRecord...");
        const retrieved = await manager.getMonthlyRecord(testUserId, monthIdentifier);

        if (!retrieved) {
            throw new Error("Failed to retrieve saved MonthlyHealthRecord.");
        }

        console.log("  ✓ Monthly record retrieved successfully.");
        console.log(`    - Retrieved ID: ${retrieved.id}`);

        console.log("[TEST 4] Cleaning up test records...");
        await manager.clearUserRecords(testUserId);

        console.log("
✅ ALL PR7.4 MONTHLY RECORD MANAGER TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR7.4 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR74Tests();
}
