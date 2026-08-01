/**
 * PR9.1: Conversational Architecture Verification Test
 */

import { ConversationTurn, ConversationState } from "../types/aiConversation";

export async function runPR91Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.1 CONVERSATIONAL ARCHITECTURE TESTS  ");
    console.log("==================================================");

    try {
        console.log("[TEST 1] Initializing Conversation State Schema...");

        const turn1: ConversationTurn = {
            turnId: "TURN_001",
            conversationId: "CONV_901",
            role: "user",
            content: "My heart rate seemed high during my walk today.",
            timestamp: Date.now(),
            detectedIntent: "VITAL_TREND_ANALYSIS",
            contextReferences: [
                { source: "DAILY_RECORD", timeframeIso: "2026-07-24" }
            ]
        };

        const state: ConversationState = {
            conversationId: "CONV_901",
            userId: "USER_PR9_TEST",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            turns: [turn1],
            activeIntent: "VITAL_TREND_ANALYSIS",
            isLockedForSafety: false
        };

        console.log(`  ✓ Conversation initialized ID: ${state.conversationId}`);
        console.log(`    - Active Intent: ${state.activeIntent}`);
        console.log(`    - Turn Count: ${state.turns.length}`);
        console.log(`    - Context Reference Source: ${state.turns[0].contextReferences?.[0].source}`);

        if (state.turns.length !== 1 || state.activeIntent !== "VITAL_TREND_ANALYSIS") {
            throw new Error("Conversation state setup validation failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR9.1 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR91Tests();
}
