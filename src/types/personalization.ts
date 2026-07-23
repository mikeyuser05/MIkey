/**
 * PR10.3: Advanced Personalization Types
 */

export interface AdaptiveUserPreferences {
    preferredTone: "EMPATHETIC" | "DIRECT" | "CLINICAL";
    activityGoalFlexibility: "STRICT" | "ADAPTIVE";
    notificationUrgencyThreshold: "LOW" | "MEDIUM" | "HIGH";
}

export interface PersonalizedInsight {
    insightId: string;
    category: "RECOVERY" | "ACTIVITY" | "CARDIOVASCULAR" | "STRESS";
    headline: string;
    detailedRecommendation: string;
    tailoredTone: string;
    confidence: number;
}
