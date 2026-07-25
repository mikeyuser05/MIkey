/**
 * NOEXCUSE HPO V2 - Persistence & Duration Manager
 * Prevents false positives by enforcing required duration checks before condition escalation.
 */

import { AlertEvaluationResult, AlertState } from '../types/pr11Triage';
import { ALERT_THRESHOLDS } from '../config/alertThresholds';

interface ActiveConditionTracker {
  firstDetectedAt: number;
  lastSeenAt: number;
  category: string;
  nodeId: string;
  lastEvaluation: AlertEvaluationResult;
}

class AlertPersistenceManager {
  private activeConditions: Map<string, ActiveConditionTracker> = new Map();

  /**
   * Evaluates duration and updates state based on continuous persistence.
   */
  public processEvaluations(
    evaluations: AlertEvaluationResult[],
    currentTimeMs: number = Date.now()
  ): AlertEvaluationResult[] {
    const processedResults: AlertEvaluationResult[] = [];
    const activeKeysInSnapshot = new Set<string>();

    for (const evalResult of evaluations) {
      // Normal or Quality-only issues do not track persistence for emergency escalation
      if (evalResult.state === 'NORMAL' || evalResult.quality !== 'VALID') {
        processedResults.push(evalResult);
        continue;
      }

      const trackerKey = `${evalResult.nodeId}_${evalResult.category}`;
      activeKeysInSnapshot.add(trackerKey);

      let tracker = this.activeConditions.get(trackerKey);

      if (!tracker) {
        // Condition started
        tracker = {
          firstDetectedAt: currentTimeMs,
          lastSeenAt: currentTimeMs,
          category: evalResult.category,
          nodeId: evalResult.nodeId,
          lastEvaluation: evalResult
        };
        this.activeConditions.set(trackerKey, tracker);
      } else {
        // Condition continues
        tracker.lastSeenAt = currentTimeMs;
        tracker.lastEvaluation = evalResult;
      }

      const durationMs = currentTimeMs - tracker.firstDetectedAt;
      const requiredMs = this.getRequiredDurationMs(evalResult.category);

      let updatedState: AlertState = evalResult.state;

      if (durationMs >= requiredMs) {
        // Condition persisted required time -> Escalate to EMERGENCY state
        updatedState = 'EMERGENCY';
      } else if (durationMs > 0) {
        updatedState = 'ESCALATING';
      }

      processedResults.push({
        ...evalResult,
        state: updatedState,
        durationMs,
        detectedAt: tracker.firstDetectedAt
      });
    }

    // Clean up conditions that are no longer active in this evaluation
    this.cleanupInactiveConditions(activeKeysInSnapshot);

    return processedResults;
  }

  private getRequiredDurationMs(category: string): number {
    switch (category) {
      case 'PHYSIOLOGICAL_HR':
        return ALERT_THRESHOLDS.HEART_RATE.persistenceRequiredMs;
      case 'PHYSIOLOGICAL_SPO2':
        return ALERT_THRESHOLDS.SPO2.persistenceRequiredMs;
      case 'ENVIRONMENTAL_GAS':
        return ALERT_THRESHOLDS.GAS_PPM.persistenceRequiredMs;
      default:
        return 10000;
    }
  }

  private cleanupInactiveConditions(activeKeys: Set<string>): void {
    for (const key of this.activeConditions.keys()) {
      if (!activeKeys.has(key)) {
        this.activeConditions.delete(key);
      }
    }
  }

  public reset(): void {
    this.activeConditions.clear();
  }
}

export const alertPersistenceManager = new AlertPersistenceManager();
