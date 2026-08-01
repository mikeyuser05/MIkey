/**
 * PR7.6: Report Generation Service Verification & Unit Tests
 */

import { ReportGeneratorService } from "../services/reportGenerator";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPR76Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.6 REPORT GENERATION SERVICE TESTS   ");
    console.log("==================================================");

    const generator = new ReportGeneratorService();
    const testUserId = "TEST_USER_PR7_6";

    // Generate 14 days of test records showing improving resting HR
    const mockDailyRecords: DailyHealthRecord[] = [];
    for (let i = 1; i <= 14; i++) {
        const dayStr = i < 10 ? `0${i}` : `${i}`;
        // Resting HR decreases from 68 BPM down to 60 BPM
        const restingHr = 68 - Math.floor(i / 2);

        mockDailyRecords.push({
            id: `${testUserId}_DAILY_2026-07-${dayStr}`,
            userId: testUserId,
            dateIso: `2026-07-${dayStr}`,
            vitals: {
                heartRate: { min: 55, max: 135, average: 72 },
                spO2: { min: 96, max: 99, average: 98.2 },
                restingHeartRate: restingHr
            },
            activity: {
                totalSteps: 9000,
                activeMinutes: 45,
                estimatedCaloriesBurned: 450
            },
            anomalyCount: 0,
            stressScore: 0.12,
            recoveryScore: 89.0,
            dataQualityRatio: 0.99,
            updatedAt: Date.now()
        });
    }

    try {
        console.log("[TEST 1] Generating Health Report from 14 Daily Records...");
        const report = generator.generateReport(testUserId, mockDailyRecords);

        console.log("  ✓ Report generated successfully.");
        console.log(`    - Report ID: ${report.reportId}`);
        console.log(`    - Date Range: ${report.timeframe.startDateIso} to ${report.timeframe.endDateIso}`);
        console.log(`    - Avg Resting HR: ${report.summary.avgRestingHeartRate} BPM`);
        console.log(`    - HR Trajectory: ${report.trends.heartRateTrajectory}`);
        console.log(`    - Clinical Notes Count: ${report.clinicalNotes.length}`);

        if (
            report.summary.totalSteps !== 126000 ||
            report.trends.heartRateTrajectory !== "IMPROVING" ||
            report.clinicalNotes.length < 3
        ) {
            throw new Error("Report metrics or trajectory evaluation failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR7.6 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR76Tests();
}
