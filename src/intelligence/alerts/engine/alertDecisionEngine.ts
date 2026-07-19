import { IAlertDecisionEngine, IAlertPayload, AlertPriority } from '../types/alerts';
import { IAlertConfig, DEFAULT_ALERT_CONFIG } from '../config/alertConfig';
import { evaluateAlertRules } from './alertRuleEngine';
import { determineAlertPriority } from './priorityEngine';
import { CooldownTracker } from './cooldownTracker';
import { EscalationTracker } from './escalationEngine';
import { buildAlertPayload } from './alertOutputBuilder';

/**
 * Coordination and structural orchestration pipeline for the PR4.5 Alert Decision Engine.
 * Consolidated evaluation processing across PR4.1, PR4.2, PR4.3, and PR4.4 parameters.
 */
export class AlertDecisionEngine implements IAlertDecisionEngine {
  private config: IAlertConfig;
  private cooldownTracker: CooldownTracker;
  private escalationTracker: EscalationTracker;
  private ongoingThreats: Map<string, number> = new Map();

  constructor(config: IAlertConfig = DEFAULT_ALERT_CONFIG) {
    this.config = config;
    this.cooldownTracker = new CooldownTracker(config);
    this.escalationTracker = new EscalationTracker(config);
  }

  /**
   * Evaluates complex multi-sensor parameters through eligibility rules, 
   * priority weights, cooldown blocks, and temporal escalation tiers.
   */
  public processAlertEvaluation(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string }; spo2: { direction: string } },
    riskStatus: { overallSeverity: string; isTransientSpike: boolean; activeRisks: Array<{ category: string; sourceRules: string[] }> },
    currentTimestamp: number = Date.now()
  ): IAlertPayload | null {
    
    // 1. Determine eligibility profile from core rules
    const rulesResult = evaluateAlertRules(telemetryMetrics, activityState, riskStatus);
    
    if (!rulesResult.isEligible || rulesResult.triggerRules.length === 0) {
      // Clear all active tracking indicators if no threats exist
      this.escalationTracker.clear();
      this.ongoingThreats.clear();
      return null;
    }

    const threatKey = `${rulesResult.category}_${rulesResult.triggerRules.sort().join('_')}`;
    
    // 2. Extract baseline operational priority
    const basePriority = determineAlertPriority(
      rulesResult.category,
      riskStatus.overallSeverity,
      rulesResult.triggerRules
    );

    // 3. Process priority escalation for ongoing structural conditions
    const finalPriority = this.escalationTracker.evaluateEscalation(
      threatKey,
      basePriority,
      currentTimestamp
    );

    // Track escalation changes to increment structural counts
    let currentCount = this.ongoingThreats.get(threatKey) || 0;
    if (finalPriority !== basePriority) {
      currentCount += 1;
      this.ongoingThreats.set(threatKey, currentCount);
    } else if (!this.ongoingThreats.has(threatKey)) {
      this.ongoingThreats.set(threatKey, 0);
    }

    // 4. Verify system throttle cooldown blocks
    const isThrottled = this.cooldownTracker.isCoolingDown(threatKey, finalPriority, currentTimestamp);
    if (isThrottled) {
      return null; // Choked by configuration throttle window
    }

    // 5. Commit dispatch timestamp profile and construct uniform output payload
    this.cooldownTracker.recordDispatch(threatKey, currentTimestamp);

    return buildAlertPayload(
      currentTimestamp,
      rulesResult.category,
      finalPriority,
      rulesResult.triggerRules,
      telemetryMetrics,
      activityState.currentActivity,
      currentCount
    );
  }

  /**
   * Clears stateful structures and trackers back to initial baseline parameters.
   */
  public reset(): void {
    this.cooldownTracker.clear();
    this.escalationTracker.clear();
    this.ongoingThreats.clear();
  }
}