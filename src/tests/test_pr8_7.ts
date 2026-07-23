/**
 * PR8.7: AI Safety Verification & Unit Tests
 */

import { AISafetyGatekeeper } from "../services/aiSafety";
import { StructuredHealthInterpretation } from "../types/aiContracts";

export async function runPR87Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.7 AI SAFETY AND GUARDRAILS TESTS   ");
    console.log("==================================================");

    const safety = new AISafetyGatekeeper();

    const mockInterpretation: StructuredHealthInterpretation = {
        interpretationId: "INT_PR87_01",
        requestId: "REQ_PR87_01",
        timestamp: Date.now(),
        category: "ANOMALY_EVALUATION",
        summary: "You have an arrhythmia alert based on recent heart rate telemetry.",
        riskLevel: "MODERATE",
        clinicalRationale: ["Heart rate variability drop observed."],
        recommendations: [
            {
                id: "REC_1",
                actionItem: "Rest and log symptoms.",
                priority: "ATTENTION_REQUIRED",
                rationale: "Observe trend."
            }
        ],
        confidenceScore: 0.88,
        disclaimer: ""
    };

    try {
        console.log("[TEST 1] Testing Emergency Detection & Phrase Sanitization...");
        const safeOutput = safety.applySafetyGuardrails(mockInterpretation);

        console.log("  ✓ Safety gatekeeper processing complete.");
        console.log(`    - Risk Level Elevated: ${safeOutput.riskLevel} (Expected: CRITICAL)`);
        console.log(`    - Emergency Recommendation Added: ${safeOutput.recommendations[0].priority === "IMMEDIATE"}`);
        console.log(`    - Sanitized Summary: "${safeOutput.summary}"`);
        console.log(`    - Mandatory Disclaimer Attached: ${safeOutput.disclaimer.length > 50}`);

        if (
            safeOutput.riskLevel !== "CRITICAL" ||
            safeOutput.summary.includes("You have") ||
            !safeOutput.disclaimer.includes("qualifying physician")
        ) {
            throw new Error("AI Safety Gatekeeper checks failed.");
        }

        console.log("
✅ ALL PR8.7 AI SAFETY TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR8.7 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR87Tests();
}
