/**
 * PR8.4: AI Contract Parser & Validation Service
 * Validates raw LLM responses against structured interpretation contracts and provides fallback formatting.
 */

import {
    StructuredHealthInterpretation,
    InterpretationRiskLevel,
    InterpretationCategory
} from "../types/aiContracts";

export class AIContractParser {
    /**
     * Parses and validates raw LLM output against StructuredHealthInterpretation
     */
    public parseInterpretationResponse(
        rawResponseText: string,
        requestId: string
    ): StructuredHealthInterpretation {
        try {
            // Attempt standard JSON parsing
            const jsonStart = rawResponseText.indexOf("{");
            const jsonEnd = rawResponseText.lastIndexOf("}");

            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonSubstring = rawResponseText.substring(jsonStart, jsonEnd + 1);
                const parsed = JSON.parse(jsonSubstring);

                if (this.isValidInterpretation(parsed)) {
                    return parsed as StructuredHealthInterpretation;
                }
            }
        } catch (e) {
            // JSON parsing failed, drop through to fallback
        }

        // Fallback execution for non-JSON or malformed outputs
        return this.constructFallbackInterpretation(rawResponseText, requestId);
    }

    /**
     * Validates required structural properties
     */
    private isValidInterpretation(obj: any): boolean {
        return (
            typeof obj === "object" &&
            obj !== null &&
            typeof obj.summary === "string" &&
            typeof obj.riskLevel === "string" &&
            Array.isArray(obj.clinicalRationale) &&
            Array.isArray(obj.recommendations)
        );
    }

    /**
     * Constructs a compliant fallback interpretation from unstructured text
     */
    public constructFallbackInterpretation(
        rawText: string,
        requestId: string
    ): StructuredHealthInterpretation {
        const containsAnomaly = rawText.toLowerCase().includes("anomaly") || rawText.toLowerCase().includes("spike");
        const riskLevel: InterpretationRiskLevel = containsAnomaly ? "MODERATE" : "LOW";
        const category: InterpretationCategory = containsAnomaly ? "ANOMALY_EVALUATION" : "PHYSIOLOGICAL_BASELINE";

        return {
            interpretationId: `INT_FB_${Date.now()}`,
            requestId,
            timestamp: Date.now(),
            category,
            summary: rawText.substring(0, 150).trim() + "...",
            riskLevel,
            clinicalRationale: [
                "Automated fallback parsing applied due to unstructured LLM response output."
            ],
            recommendations: [
                {
                    id: "REC_FB_01",
                    actionItem: "Continue regular resting heart rate and activity monitoring.",
                    priority: "ROUTINE",
                    rationale: "Baseline tracking continuation."
                }
            ],
            confidenceScore: 0.70,
            disclaimer: "This interpretation was extracted using fallback schema recovery."
        };
    }
}
