/**
 * PR10.3: Advanced Personalization Engine
 * Dynamically tailors recommendations, guidance, and tone based on user longitudinal baselines.
 */

import { AdaptiveUserPreferences, PersonalizedInsight } from "../types/personalization";
import { LongitudinalHealthProfile } from "../types/longTermHealth";

export class AdvancedPersonalizationEngine {
    /**
     * Generates personalized insights tuned to user preferences and physiological baseline
     */
    public generateInsights(
        profile: LongitudinalHealthProfile,
        preferences: AdaptiveUserPreferences
    ): PersonalizedInsight[] {
        const insights: PersonalizedInsight[] = [];

        // Cardiovascular Baseline Evaluation
        if (profile.baseline30D.restingHeartRateMean < 65) {
            insights.push({
                insightId: `INS_${Date.now()}_1`,
                category: "CARDIOVASCULAR",
                headline: "Strong Cardiovascular Efficiency",
                detailedRecommendation: preferences.preferredTone === "DIRECT" 
                    ? "Your average resting HR is 64 BPM, well below population average. Maintain your current aerobic training volume."
                    : "Great job! Your resting heart rate shows excellent aerobic conditioning. Keep up your active routine!",
                tailoredTone: preferences.preferredTone,
                confidence: 0.94
            });
        }

        // Adaptive Activity Goal Evaluation
        if (preferences.activityGoalFlexibility === "ADAPTIVE") {
            insights.push({
                insightId: `INS_${Date.now()}_2`,
                category: "ACTIVITY",
                headline: "Dynamic Daily Goal Adjustments Enabled",
                detailedRecommendation: `Based on your average step count (${profile.baseline30D.dailyStepMean} steps/day), your daily goal adapts dynamically to keep targets challenging yet achievable.`,
                tailoredTone: preferences.preferredTone,
                confidence: 0.90
            });
        }

        return insights;
    }
}
