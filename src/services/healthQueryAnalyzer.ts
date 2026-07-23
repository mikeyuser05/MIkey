/**
 * PR9.2: Health Query Understanding Service
 * Classifies user intent, extracts health entities, and triages query emergency status.
 */

import { HealthQueryIntent } from "../types/aiConversation";

export interface ExtractedHealthEntities {
    metricTypes: string[];
    timeframeKeywords: string[];
    symptoms: string[];
    isEmergency: boolean;
}

export interface QueryAnalysisResult {
    rawQuery: string;
    intent: HealthQueryIntent;
    entities: ExtractedHealthEntities;
    confidenceScore: number;
}

export class HealthQueryAnalyzer {
    private readonly emergencyKeywords = [
        "chest pain", "shortness of breath", "fainting",
        "unconscious", "stroke", "severe bleeding"
    ];

    private readonly vitalKeywords = [
        "heart rate", "pulse", "spo2", "blood oxygen",
        "steps", "calories", "sleep", "rhr", "resting heart rate"
    ];

    /**
     * Analyzes free-form user health query to extract intent, metrics, and risk status
     */
    public analyzeQuery(query: string): QueryAnalysisResult {
        const lowerQuery = query.toLowerCase();
        const isEmergency = this.emergencyKeywords.some(kw => lowerQuery.includes(kw));

        // 1. Emergency Escalation Priority
        if (isEmergency) {
            return {
                rawQuery: query,
                intent: "EMERGENCY_ESCALATION",
                entities: {
                    metricTypes: [],
                    timeframeKeywords: [],
                    symptoms: this.emergencyKeywords.filter(kw => lowerQuery.includes(kw)),
                    isEmergency: true
                },
                confidenceScore: 0.99
            };
        }

        // 2. Extract Metrics and Intent
        const extractedMetrics = this.vitalKeywords.filter(kw => lowerQuery.includes(kw));
        let intent: HealthQueryIntent = "GENERAL_WELLNESS";

        if (extractedMetrics.length > 0) {
            intent = "VITAL_TREND_ANALYSIS";
        } else if (lowerQuery.includes("feel") || lowerQuery.includes("pain") || lowerQuery.includes("dizzy")) {
            intent = "SYMPTOM_CHECK";
        } else if (lowerQuery.includes("medication") || lowerQuery.includes("pill") || lowerQuery.includes("dose")) {
            intent = "MEDICATION_INQUIRY";
        }

        // Timeframe Detection
        const timeframeKeywords: string[] = [];
        if (lowerQuery.includes("today")) timeframeKeywords.push("TODAY");
        if (lowerQuery.includes("yesterday")) timeframeKeywords.push("YESTERDAY");
        if (lowerQuery.includes("week") || lowerQuery.includes("7 days")) timeframeKeywords.push("PAST_7_DAYS");

        return {
            rawQuery: query,
            intent,
            entities: {
                metricTypes: extractedMetrics,
                timeframeKeywords,
                symptoms: [],
                isEmergency: false
            },
            confidenceScore: 0.88
        };
    }
}
