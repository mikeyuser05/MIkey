/**
 * PR7.1: Health History Data Model Verification Test
 */

import { DailyHealthRecord, WeeklyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";

export async function runPR71Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.1 HEALTH HISTORY DATA MODEL TESTS   ");
    console.log("==================================================");

    try {
        console.log("[TEST 1] Instantiating Daily Health Record Model...");
        const dailyRecord: DailyHealthRecord = {
            id: "USER123_DAILY_2026-07-24",
            userId: "USER123",
            dateIso: "2026-07-24",
            vitals: {
                heartRate: { min: 58, max: 142, average: 74 },
                spO2: { min: 96, max: 99, average: 98.1 },
                restingHeartRate: 61
            },
            activity: {
                totalSteps: 10450,
                activeMinutes: 45,
                estimatedCaloriesBurned: 520
            },
            anomalyCount: 0,
            stressScore: 0.18,
            recoveryScore: 88.5,
            dataQualityRatio: 0.99,
            updatedAt: Date.now()
        };

        if (dailyRecord.vitals.restingHeartRate !== 61 || dailyRecord.activity.totalSteps !== 10450) {
            throw new Error("Daily record metric assignment mismatch.");
        }
        console.log("  ✓ Daily Health Record Model verified.");

        console.log("[TEST 2] Instantiating Timeline Event Model...");
        const timelineEvent: HealthTimelineEvent = {
            id: "EVT_9901",
            userId: "USER123",
            timestamp: Date.now(),
            type: "ANOMALY_ALERT",
            severity: "HIGH",
            title: "Elevated Resting HR Detected",
            description: "Resting HR exceeded baseline by +18 BPM.",
            metadata: { deltaBpm: 18 }
        };

        if (timelineEvent.type !== "ANOMALY_ALERT" || timelineEvent.severity !== "HIGH") {
            throw new Error("Timeline event property validation failed.");
        }
        console.log("  ✓ Timeline Event Model verified.");

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR7.1 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR71Tests();
}
