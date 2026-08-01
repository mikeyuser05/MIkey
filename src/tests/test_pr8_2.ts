/**
 * PR8.2: Structured Health Context Builder Verification & Unit Tests
 */

import { HealthContextBuilder } from "../services/healthContextBuilder";
import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { UserHealthBaseline } from "../types/aiContext";

export async function runPR82Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.2 STRUCTURED HEALTH CONTEXT TESTS  ");
    console.log("==================================================");

    const builder = new HealthContextBuilder();
    const rawUserId = "USER_JOHN_DOE_12345";

    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 62.0,
        avgSpO2: 98.5,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 45
    };

    // Generate 20 daily records to test token pruning
    const mockDailyRecords: DailyHealthRecord[] = [];
    for (let i = 1; i <= 20; i++) {
        const dayStr = i < 10 ? `0${i}` : `${i}`;
        mockDailyRecords.push({
            id: `REC_2026-07-${dayStr}`,
            userId: rawUserId,
            dateIso: `2026-07-${dayStr}`,
            vitals: {
                heartRate: { min: 60, max: 130, average: 75 },
                spO2: { min: 96, max: 99, average: 98.0 },
                restingHeartRate: 62.0
            },
            activity: {
                totalSteps: 8500,
                activeMinutes: 40,
                estimatedCaloriesBurned: 400
            },
            anomalyCount: 0,
            stressScore: 0.12,
            recoveryScore: 88.0,
            dataQualityRatio: 0.99,
            updatedAt: Date.now()
        });
    }

    const mockEvents: HealthTimelineEvent[] = [
        {
            id: "EVT_1",
            userId: rawUserId,
            timestamp: Date.now() - 3600000,
            type: "ANOMALY_ALERT",
            severity: "HIGH",
            title: "Tachycardia Spike",
            description: "Heart rate exceeded 135 BPM during rest.",
            metadata: {}
        }
    ];

    try {
        console.log("[TEST 1] Compiling Token-Budgeted AI Context Window...");
        const contextWindow = builder.buildContextWindow(
            rawUserId,
            baseline,
            mockDailyRecords,
            mockEvents,
            { maxTokens: 1024 } // Tight budget to force pruning
        );

        console.log("  ✓ Context window built successfully.");
        console.log(`    - Anonymized Subject ID: ${contextWindow.userContext.subjectId}`);
        console.log(`    - Records Included (Pruned): ${contextWindow.historicalRecords.length} / 20`);
        console.log(`    - Events Included: ${contextWindow.recentEvents.length}`);
        console.log(`    - Estimated Token Count: ${contextWindow.estimatedTokenCount}`);

        if (
            contextWindow.userContext.subjectId.includes(rawUserId) ||
            contextWindow.historicalRecords.length >= 20 ||
            contextWindow.estimatedTokenCount > 1024
        ) {
            throw new Error("Context pruning or anonymization validation failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR8.2 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR82Tests();
}
