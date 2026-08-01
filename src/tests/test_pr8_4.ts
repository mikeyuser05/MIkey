/**
 * PR8.4: Request & Response Contracts Verification Test
 */

import { AIContractParser } from "../services/aiContractParser";
import { StructuredHealthInterpretation } from "../types/aiContracts";

export async function runPR84Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR8.4 REQUEST & RESPONSE CONTRACT TESTS ");
    console.log("==================================================");

    const parser = new AIContractParser();
    const requestId = "REQ_PR84_TEST";

    const mockValidJson = JSON.stringify({
        interpretationId: "INT_PR84_1001",
        requestId,
        timestamp: Date.now(),
        category: "RECOVERY_ANALYSIS",
        summary: "Post-workout recovery rate demonstrates strong cardiovascular adaptation.",
        riskLevel: "LOW",
        clinicalRationale: [
            "Heart rate drop rate exceeded 25 BPM in the first post-exercise minute."
        ],
        recommendations: [
            {
                id: "REC_1",
                actionItem: "Maintain hydration and recovery protocol.",
                priority: "ROUTINE",
                rationale: "Supports optimal physiological bounce-back."
            }
        ],
        confidenceScore: 0.95,
        disclaimer: "For informational purposes only."
    });

    const mockUnstructuredText = "Subject showed normal resting heart rate of 62 BPM throughout the night. No anomalies noted.";

    try {
        console.log("[TEST 1] Parsing Valid JSON Response Payload...");
        const parsedJson = parser.parseInterpretationResponse(mockValidJson, requestId);

        console.log("  ✓ Structured JSON response parsed successfully.");
        console.log(`    - Summary: "${parsedJson.summary}"`);
        console.log(`    - Risk Level: ${parsedJson.riskLevel}`);
        console.log(`    - Confidence Score: ${parsedJson.confidenceScore}`);

        if (parsedJson.riskLevel !== "LOW" || parsedJson.confidenceScore !== 0.95) {
            throw new Error("JSON response parsing or validation failed.");
        }

        console.log("[TEST 2] Parsing Unstructured Text via Fallback Parser...");
        const fallbackParsed = parser.parseInterpretationResponse(mockUnstructuredText, requestId);

        console.log("  ✓ Fallback response formatted successfully.");
        console.log(`    - Category: ${fallbackParsed.category}`);
        console.log(`    - Risk Level: ${fallbackParsed.riskLevel}`);
        console.log(`    - Rationale Count: ${fallbackParsed.clinicalRationale.length}`);

        if (fallbackParsed.confidenceScore !== 0.70 || !fallbackParsed.disclaimer.includes("fallback")) {
            throw new Error("Fallback parser contract compliance failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR8.4 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR84Tests();
}
