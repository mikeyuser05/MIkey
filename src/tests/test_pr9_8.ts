/**
 * PR9.8: End-to-End Chat & QA Integration Verification Test
 */

import { ChatQAService } from "../services/chatQAService";
import { UserHealthBaseline } from "../types/aiContext";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPR98Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.8 END-TO-END CHAT & QA TESTS        ");
    console.log("==================================================");

    const chatService = new ChatQAService();

    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 65,
        avgSpO2: 98,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 40
    };

    const records: DailyHealthRecord[] = [
        {
            id: "REC_98_01",
            userId: "USER_98",
            dateIso: "2026-07-24",
            vitals: { heartRate: { min: 60, max: 125, average: 70 }, spO2: { min: 97, max: 99, average: 98.5 }, restingHeartRate: 63 },
            activity: { totalSteps: 10500, activeMinutes: 50, estimatedCaloriesBurned: 500 },
            anomalyCount: 0,
            stressScore: 0.10,
            recoveryScore: 90,
            dataQualityRatio: 1.0,
            updatedAt: Date.now()
        }
    ];

    try {
        console.log("[TEST 1] Executing Turn 1: Standard Health Question...");
        const res1 = await chatService.handleUserMessage({
            conversationId: "CONV_98_INTEG",
            userId: "USER_98",
            userQuery: "How was my resting heart rate today?",
            baseline,
            records,
            events: []
        });

        console.log(`  ✓ Turn 1 Complete. Turn Count: ${res1.conversationState.turns.length}`);
        console.log(`  ✓ Active Intent: ${res1.conversationState.activeIntent}`);
        console.log(`  ✓ Safety Disclaimer Attached: ${res1.responseContent.includes("Medical Disclaimer")}`);

        if (res1.conversationState.turns.length !== 2 || !res1.responseContent.includes("Medical Disclaimer")) {
            throw new Error("Turn 1 execution failed.");
        }

        console.log("[TEST 2] Executing Turn 2: Follow-up Question in Same Session...");
        const res2 = await chatService.handleUserMessage({
            conversationId: "CONV_98_INTEG",
            userId: "USER_98",
            userQuery: "Did I hit my step goal as well?",
            baseline,
            records,
            events: []
        });

        console.log(`  ✓ Turn 2 Complete. Total Turns in History: ${res2.conversationState.turns.length}`);

        if (res2.conversationState.turns.length !== 4) {
            throw new Error("Turn 2 multi-turn history threading failed.");
        }

        console.log("
✅ ALL PR9.8 END-TO-END CHAT & QA TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR9.8 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR98Tests();
}
