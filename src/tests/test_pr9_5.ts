/**
 * PR9.5: AI Conversation Pipeline Verification Test
 */

import { AIConversationPipeline } from "../services/aiConversationPipeline";
import { ConversationState } from "../types/aiConversation";
import { UserHealthBaseline } from "../types/aiContext";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPR95Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.5 AI CONVERSATION PIPELINE TESTS    ");
    console.log("==================================================");

    const pipeline = new AIConversationPipeline();

    const initialState: ConversationState = {
        conversationId: "CONV_TEST_95",
        userId: "USER_TEST_95",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        turns: [],
        activeIntent: "GENERAL_WELLNESS",
        isLockedForSafety: false
    };

    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 64,
        avgSpO2: 98,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 30
    };

    const records: DailyHealthRecord[] = [
        {
            id: "REC_95_01",
            userId: "USER_TEST_95",
            dateIso: "2026-07-24",
            vitals: { heartRate: { min: 60, max: 120, average: 72 }, spO2: { min: 97, max: 99, average: 98 }, restingHeartRate: 64 },
            activity: { totalSteps: 10200, activeMinutes: 45, estimatedCaloriesBurned: 480 },
            anomalyCount: 0,
            stressScore: 0.15,
            recoveryScore: 85,
            dataQualityRatio: 1.0,
            updatedAt: Date.now()
        }
    ];

    try {
        console.log("[TEST 1] Processing standard user dialogue turn...");
        const result = await pipeline.processUserTurn(
            initialState,
            "How does my step count look today?",
            baseline,
            records,
            []
        );

        console.log(`  ✓ Turn processed. Updated turns count: ${result.updatedState.turns.length}`);
        console.log(`    - Active Intent: ${result.updatedState.activeIntent}`);
        console.log(`    - Safety Lock Status: ${result.updatedState.isLockedForSafety}`);
        console.log(`    - Assistant Output: "${result.assistantResponse.substring(0, 60)}..."`);

        if (result.updatedState.turns.length !== 2 || !result.assistantResponse.includes("DISCLAIMER")) {
            throw new Error("Conversation pipeline turn execution failed.");
        }

        console.log("
✅ ALL PR9.5 AI CONVERSATION PIPELINE TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR9.5 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR95Tests();
}
