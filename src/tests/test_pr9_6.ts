/**
 * PR9.6: Conversation History Verification Test
 */

import { ConversationHistoryManager } from "../services/conversationHistoryManager";
import { ConversationState, ConversationTurn } from "../types/aiConversation";

export async function runPR96Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.6 CONVERSATION HISTORY TESTS        ");
    console.log("==================================================");

    const historyManager = new ConversationHistoryManager(4); // Cap at 4 turns for testing

    const turns: ConversationTurn[] = [
        { turnId: "T1", conversationId: "CONV_96", role: "user", content: "Initial query", timestamp: 100 },
        { turnId: "T2", conversationId: "CONV_96", role: "assistant", content: "Response 1", timestamp: 101 },
        { turnId: "T3", conversationId: "CONV_96", role: "user", content: "Follow-up 1", timestamp: 102 },
        { turnId: "T4", conversationId: "CONV_96", role: "assistant", content: "Response 2", timestamp: 103 },
        { turnId: "T5", conversationId: "CONV_96", role: "user", content: "Follow-up 2", timestamp: 104 }
    ];

    const initialState: ConversationState = {
        conversationId: "CONV_96",
        userId: "USER_96",
        createdAt: 100,
        updatedAt: 104,
        turns,
        activeIntent: "GENERAL_WELLNESS",
        isLockedForSafety: false
    };

    try {
        console.log("[TEST 1] Applying Sliding Window Memory Compaction...");
        historyManager.saveState(initialState);
        const retrieved = historyManager.getState("CONV_96");

        if (!retrieved) {
            throw new Error("Failed to retrieve conversation state.");
        }

        console.log(`  ✓ Original Turn Count: ${turns.length}`);
        console.log(`  ✓ Compacted Turn Count: ${retrieved.turns.length}`);
        console.log(`  ✓ Retained Initial Turn ID: ${retrieved.turns[0].turnId}`);
        console.log(`  ✓ Latest Turn ID: ${retrieved.turns[retrieved.turns.length - 1].turnId}`);

        if (retrieved.turns.length !== 4 || retrieved.turns[0].turnId !== "T1" || retrieved.turns[3].turnId !== "T5") {
            throw new Error("Sliding window history pruning failed.");
        }

        console.log("
✅ ALL PR9.6 CONVERSATION HISTORY TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR9.6 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR96Tests();
}
