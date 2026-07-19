import { IRecommendationEngine, IStructuredRecommendationOutput } from '../types/recommendations';
import { IRecommendationConfig, DEFAULT_RECOMMENDATION_CONFIG } from '../config/recommendationConfig';
import { evaluateRecommendationRules } from './recGenerationEngine';
import { rankRecommendations } from './rankingEngine';
import { resolveRecommendationConflicts } from './conflictResolution';
import { RecCooldownTracker } from './recCooldownTracker';
import { buildRecommendationOutput } from './recOutputBuilder';

/**
 * Coordination and structural orchestration pipeline for the PR4.6 Recommendation Engine.
 * Consolidated evaluation processing across PR4.1, PR4.2, PR4.3, PR4.4, and PR4.5 parameters.
 */
export class RecommendationEngine implements IRecommendationEngine {
  private config: IRecommendationConfig;
  private cooldownTracker: RecCooldownTracker;

  constructor(config: IRecommendationConfig = DEFAULT_RECOMMENDATION_CONFIG) {
    this.config = config;
    this.cooldownTracker = new RecCooldownTracker(config);
  }

  /**
   * Orchestrates the transformation of complex pipeline states into fully qualified, 
   * prioritized, and deduplicated actionable recommendations.
   */
  public generateRecommendations(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string }; spo2: { direction: string } },
    riskStatus: { overallSeverity: string; isTransientSpike: boolean },
    alertPayload: { priority: string; triggerRules: string[] } | null,
    currentTimestamp: number = Date.now()
  ): IStructuredRecommendationOutput {
    
    // 1. Generate baseline recommendation vectors from incoming engine primitives
    const baseRecs = evaluateRecommendationRules(
      telemetryMetrics,
      activityState,
      trendSummary,
      riskStatus,
      alertPayload
    );

    // 2. Filter out items currently locked within their configured throttle windows
    const nonThrottledRecs = baseRecs.filter(rec => 
      !this.cooldownTracker.isCoolingDown(rec.code, currentTimestamp)
    );

    // 3. Rank remaining recommendations by assigned priority weights
    const rankedRecs = rankRecommendations(nonThrottledRecs, this.config);

    // 4. Resolve overlapping or mutually exclusive actions
    const resolvedRecs = resolveRecommendationConflicts(rankedRecs, this.config);

    // 5. Lock in cooldown anchors for items successfully passing the resolution matrix
    resolvedRecs.forEach(rec => {
      this.cooldownTracker.recordIssuance(rec.code, currentTimestamp);
    });

    // 6. Build final structured and standardized payload format
    return buildRecommendationOutput(currentTimestamp, resolvedRecs);
  }

  /**
   * Resets internal tracking layers to initial state.
   */
  public reset(): void {
    this.cooldownTracker.clear();
  }
}