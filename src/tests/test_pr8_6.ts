/**
 * PR8.6: AI Health Interpretation Verification Test
 */

import { HealthInterpretationService } from "../services/healthInterpretationService";
import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { UserHealthBaseline } from "../types/aiContext";

export async function runPR86Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.6 AI HEALTH INTERPRETATION TESTS   ");
    console.log("==================================================");

    const service = new HealthInterpretationService();
    const userId = "USER_PHYSIO_86";

    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 64.0,
        avgSpO2: 98.1,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 45
    };

    const dailyRecords: DailyHealthRecord[] = [
        {
            id: "REC_2026-07-24",
            userId,
            dateIso: "2026-07-24",
            vitals: {
                heartRate: { min: 58, max: 125, average: 72 },
                spO2: { min: 96, max: 99, average: 98.0 },
                restingHeartRate: 64.0
            },
            activity: {
                totalSteps: 9200,
                activeMinutes: 42,
                estimatedCaloriesBurned: 450
            },
            anomalyCount: 0,
            stressScore: 0.15,
            recoveryScore: 85.0,
            dataQualityRatio: 0.98,
            updatedAt: Date.now()
        }
    ];

    const events: HealthTimelineEvent[] = [];

    try {
        console.log("[TEST 1] Executing End-to-End Interpretation Pipeline...");
        const interpretation = await service.interpretUserHealth(
            userId,
            baseline,
            dailyRecords,
            events,
            "Assess current cardiovascular stability."
        );

        console.log("  ✓ Interpretation completed successfully.");
        console.log(`    - Interpretation ID: ${interpretation.interpretationId}`);
        console.log(`    - Summary: "${interpretation.summary}"`);
        console.log(`    - Risk Level: ${interpretation.riskLevel}`);
        console.log(`    - Recommendations: ${interpretation.recommendations.length}`);

        if (!interpretation.interpretationId || !interpretation.summary) {
            throw new Error("Health interpretation output failed validation checks.");
        }

        console.log("
✅ ALL PR8.6 AI HEALTH INTERPRETATION TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR8.6 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR86Tests();
}
