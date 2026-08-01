/**
 * PR6.4: Trend Engine Verification & Unit Tests
 */

import { TrendEngine } from "../services/trendEngine";
import { AnalyticsRecord } from "../types/analytics";

export async function runPR64Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR6.4 TREND DETECTION ENGINE TESTS     ");
    console.log("==================================================");

    const trendEngine = new TrendEngine();
    const testUserId = "TEST_USER_PR6_4";

    // Create 10 days of degrading health data (increasing resting HR, decreasing steps)
    const mockRecords: AnalyticsRecord[] = [];
    for (let i = 0; i < 10; i++) {
        const dayStr = i < 9 ? `0${i + 1}` : `${i + 1}`;
        const dateIso = `2026-07-${dayStr}`;

        mockRecords.push({
            id: `${testUserId}_DAILY_${dateIso}`,
            userId: testUserId,
            bucketType: "DAILY",
            windowStartIso: `${dateIso}T00:00:00.000Z`,
            windowEndIso: `${dateIso}T23:59:59.999Z`,
            telemetry: {
                heartRate: { min: 60 + i, max: 140, mean: 75 + i, median: 74, stdDev: 8.0, sampleCount: 1440 },
                spO2: { min: 95, max: 99, mean: 98.0 - (i * 0.1), median: 98, stdDev: 0.5, sampleCount: 1440 },
                accelMagnitude: { min: 9.7, max: 15.0, mean: 10.0, median: 9.8, stdDev: 1.0, sampleCount: 1440 },
                totalStepCount: 10000 - (i * 500), // Steps dropping by 500/day
                dataQualityRatio: 1.0
            },
            stability: {
                restingHeartRate: 60 + i, // Climbing resting HR (60 to 69 BPM)
                spO2StabilityScore: 0.98 - (i * 0.02),
                postActivityRecoveryRateBpmPerMin: 18.0,
                stressProxyIndex: 0.1 + (i * 0.03)
            },
            primaryContext: "RESTING",
            anomalyCount: 0,
            updatedAt: Date.now()
        });
    }

    try {
        console.log("[TEST 1] Executing Trend Analysis across 10-day time series...");
        const report = trendEngine.analyzeTrends(testUserId, mockRecords);

        console.log("  ✓ Trend Analysis Complete.");
        console.log(`    - Overall Trajectory: ${report.overallHealthTrajectory}`);
        console.log(`    - Resting HR Trend: ${report.trends.RESTING_HEART_RATE.direction} (Slope: ${report.trends.RESTING_HEART_RATE.slope}, % Change: ${report.trends.RESTING_HEART_RATE.percentChange}%)`);
        console.log(`    - Total Steps Trend: ${report.trends.TOTAL_STEPS.direction} (Slope: ${report.trends.TOTAL_STEPS.slope}, % Change: ${report.trends.TOTAL_STEPS.percentChange}%)`);

        if (report.trends.RESTING_HEART_RATE.direction !== "DEGRADING") {
            throw new Error(`Expected RESTING_HEART_RATE trend to be DEGRADING, got ${report.trends.RESTING_HEART_RATE.direction}`);
        }

        if (report.trends.TOTAL_STEPS.direction !== "DEGRADING") {
            throw new Error(`Expected TOTAL_STEPS trend to be DEGRADING, got ${report.trends.TOTAL_STEPS.direction}`);
        }

        if (report.overallHealthTrajectory !== "DEGRADING") {
            throw new Error(`Expected overall trajectory to be DEGRADING, got ${report.overallHealthTrajectory}`);
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR6.4 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR64Tests();
}
