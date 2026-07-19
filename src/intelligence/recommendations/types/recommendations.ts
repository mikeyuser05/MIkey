/**
 * NOEXCUSE HPO V2: PR4.6 Recommendation Domain Types
 */

export type RecommendationPriority = 'INFO' | 'PREVENTIVE' | 'ACTION_REQUIRED' | 'EMERGENCY_ACTION';

export interface IRecommendation {
  id: string;
  code: string;
  priority: RecommendationPriority;
  actionItem: string;
  rationale: string;
}

export interface IStructuredRecommendationOutput {
  timestamp: number;
  recommendations: IRecommendation[];
  primaryActionCode: string;
}

export interface IRecommendationEngine {
  generateRecommendations(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string }; spo2: { direction: string } },
    riskStatus: { overallSeverity: string; isTransientSpike: boolean },
    alertPayload: { priority: string; triggerRules: string[] } | null,
    currentTimestamp: number
  ): IStructuredRecommendationOutput;
  reset(): void;
}