/**
 * PR8.4: Request and Response Contracts
 * Strictly typed schema interfaces for structured AI health interpretations.
 */

export type InterpretationRiskLevel = "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL";

export type InterpretationCategory =
    | "PHYSIOLOGICAL_BASELINE"
    | "RECOVERY_ANALYSIS"
    | "ANOMALY_EVALUATION"
    | "ACTIVITY_IMPACT";

export interface ClinicalRecommendation {
    id: string;
    actionItem: string;
    priority: "ROUTINE" | "ATTENTION_REQUIRED" | "IMMEDIATE";
    rationale: string;
}

export interface StructuredHealthInterpretation {
    interpretationId: string;
    requestId: string;
    timestamp: number;
    category: InterpretationCategory;
    summary: string;
    riskLevel: InterpretationRiskLevel;
    clinicalRationale: string[];
    recommendations: ClinicalRecommendation[];
    confidenceScore: number; // 0.0 to 1.0
    disclaimer: string;
}
