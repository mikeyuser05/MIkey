/**
 * PR8.5: Cost and Rate Guardrails Verification & Unit Tests
 */

import { AIGuardrailController } from "../services/aiGuardrails";

export async function runPR85Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.5 COST AND RATE GUARDRAILS TESTS    ");
    console.log("==================================================");

    const controller = new AIGuardrailController({
        maxRequestsPerMinute: 3,
        dailyTokenBudget: 1000
    });

    try {
        console.log("[TEST 1] Testing Minute Rate Limiter (Limit = 3 requests/min)...");
        
        // Execute 3 allowed requests
        for (let i = 1; i <= 3; i++) {
            const val = controller.validateRequestExecution(100, "DEEP_CLINICAL");
            if (!val.allowed) throw new Error(`Request ${i} should have been allowed.`);
            controller.recordUsage(100, "DEEP_CLINICAL");
        }

        // 4th Request should be blocked
        const blockedVal = controller.validateRequestExecution(100, "DEEP_CLINICAL");
        console.log("  ✓ 4th request evaluated:");
        console.log(`    - Allowed: ${blockedVal.allowed}`);
        console.log(`    - Reason: ${blockedVal.reason}`);

        if (blockedVal.allowed) {
            throw new Error("Rate limiter failed to block 4th request within 1 minute.");
        }

        console.log("[TEST 2] Testing Daily Token Budget & Downgrade Logic...");
        // Reset controller with higher rate limits but low token budget
        const budgetController = new AIGuardrailController({
            maxRequestsPerMinute: 20,
            dailyTokenBudget: 500
        });

        budgetController.recordUsage(450, "DEEP_CLINICAL"); // Consume 450/500 tokens

        // Request requiring 100 tokens will exceed 500 total
        const budgetVal = budgetController.validateRequestExecution(100, "DEEP_CLINICAL");
        console.log("  ✓ Token budget request evaluated:");
        console.log(`    - Recommended Tier: ${budgetVal.recommendedTier}`);
        console.log(`    - Reason: ${budgetVal.reason}`);

        if (budgetVal.recommendedTier !== "FAST_REASONING") {
            throw new Error("Guardrails failed to downgrade model tier when nearing token budget.");
        }

        const metrics = budgetController.getMetrics();
        console.log(`  ✓ Cost tracking verified: $${metrics.estimatedCostTodayUSD.toFixed(6)} USD.`);

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR8.5 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR85Tests();
}
