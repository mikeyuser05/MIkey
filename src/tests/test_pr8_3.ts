/**
 * PR8.3: AI Provider Abstraction Verification & Unit Tests
 */

import {
    GeminiHealthProvider,
    FastReasoningLocalProvider,
    AIProviderRouter,
    AIInferenceRequest
} from "../services/aiProvider";
import { AIContextWindow } from "../types/aiContext";

export async function runPR83Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.3 AI PROVIDER ABSTRACTION TESTS    ");
    console.log("==================================================");

    const router = new AIProviderRouter();

    const mockContext: AIContextWindow = {
        userContext: {
            subjectId: "SUBJ_TEST_83_ANON",
            baseline: {
                avgRestingHeartRate: 63,
                avgSpO2: 98.4,
                dailyStepGoal: 10000,
                typicalActiveMinutes: 45
            }
        },
        historicalRecords: [],
        recentEvents: [],
        generatedAt: Date.now(),
        estimatedTokenCount: 200
    };

    const request: AIInferenceRequest = {
        requestId: "REQ_PR83_001",
        contextWindow: mockContext,
        systemPrompt: "You are an expert physiological assessment assistant.",
        userQuery: "Summarize current vital status.",
        modelTier: "DEEP_CLINICAL"
    };

    try {
        console.log("[TEST 1] Testing Primary Provider (GeminiHealthProvider)...");
        const primaryProvider = router.getProvider("DEEP_CLINICAL");
        const resPrimary = await primaryProvider.executeInference(request);

        console.log("  ✓ Primary provider response received.");
        console.log(`    - Provider: ${resPrimary.providerName}`);
        console.log(`    - Latency: ${resPrimary.latencyMs}ms`);
        console.log(`    - Total Tokens: ${resPrimary.tokensUsed.totalTokens}`);

        if (resPrimary.providerName !== "GeminiHealthProvider") {
            throw new Error("Provider routing failed for DEEP_CLINICAL model tier.");
        }

        console.log("[TEST 2] Testing Fallback Provider (FastReasoningLocalProvider)...");
        const fallbackProvider = router.getProvider("FAST_REASONING");
        const resFallback = await fallbackProvider.executeInference({ ...request, modelTier: "FAST_REASONING" });

        console.log("  ✓ Fallback provider response received.");
        console.log(`    - Provider: ${resFallback.providerName}`);
        console.log(`    - Latency: ${resFallback.latencyMs}ms`);

        if (resFallback.providerName !== "FastReasoningLocalProvider") {
            throw new Error("Provider routing failed for FAST_REASONING model tier.");
        }

        console.log("
✅ ALL PR8.3 AI PROVIDER ABSTRACTION TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR8.3 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR83Tests();
}
