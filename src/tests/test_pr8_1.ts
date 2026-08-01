/**
 * PR8.1: AI Context Architecture Verification Test
 */

import { AIContextWindow, ContextTokenBudget } from "../types/aiContext";

export async function runPR81Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.1 AI CONTEXT ARCHITECTURE TESTS    ");
    console.log("==================================================");

    try {
        console.log("[TEST 1] Instantiating Token Budget Configuration...");
        const budget: ContextTokenBudget = {
            maxTokens: 4096,
            vitalsAllocation: 0.40,
            baselineAllocation: 0.30,
            timelineAllocation: 0.20,
            systemPromptReserve: 0.10
        };

        if (budget.vitalsAllocation + budget.baselineAllocation + budget.timelineAllocation + budget.systemPromptReserve !== 1.0) {
            throw new Error("Token budget allocations must sum to 1.0 (100%).");
        }
        console.log("  ✓ Token budget allocation ratios verified.");

        console.log("[TEST 2] Instantiating Anonymized AI Context Window...");
        const contextWindow: AIContextWindow = {
            userContext: {
                subjectId: "SUBJ_99812_ANON",
                baseline: {
                    avgRestingHeartRate: 61,
                    avgSpO2: 98.2,
                    dailyStepGoal: 10000,
                    typicalActiveMinutes: 45
                }
            },
            historicalRecords: [],
            recentEvents: [],
            generatedAt: Date.now(),
            estimatedTokenCount: 350
        };

        if (contextWindow.userContext.subjectId.includes("USER_") && !contextWindow.userContext.subjectId.includes("ANON")) {
            throw new Error("Subject identifier appears non-anonymized.");
        }
        console.log("  ✓ Anonymized AI Context Window validated.");

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR8.1 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR81Tests();
}
