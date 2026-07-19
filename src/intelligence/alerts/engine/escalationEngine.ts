import { AlertPriority } from '../types/alerts';
import { IAlertConfig } from '../config/alertConfig';

export interface IEscalationState {
  firstAlertTimestamp: number;
  lastAlertTimestamp: number;
  currentPriority: AlertPriority;
}

/**
 * Pure deterministic escalation node.
 * Monitors temporal duration of ongoing active threat vectors and upgrades 
 * operational dispatch priority thresholds accordingly.
 */
export class EscalationTracker {
  private escalationMap: Map<string, IEscalationState> = new Map();
  private config: IAlertConfig;

  constructor(config: IAlertConfig) {
    this.config = config;
  }

  /**
   * Tracks threat duration and returns an escalated priority level if temporal
   * thresholds have been breached.
   */
  public evaluateEscalation(
    threatKey: string,
    initialPriority: AlertPriority,
    currentTimestamp: number
  ): AlertPriority {
    const state = this.escalationMap.get(threatKey);

    if (!state) {
      this.escalationMap.set(threatKey, {
        firstAlertTimestamp: currentTimestamp,
        lastAlertTimestamp: currentTimestamp,
        currentPriority: initialPriority
      });
      return initialPriority;
    }

    state.lastAlertTimestamp = currentTimestamp;
    const elapsed = currentTimestamp - state.firstAlertTimestamp;

    // Escalation Matrix Mapping
    if (
      state.currentPriority === 'WARNING' && 
      elapsed >= this.config.escalationThresholdsMs.warningToHighMs
    ) {
      state.currentPriority = 'HIGH';
    } else if (
      state.currentPriority === 'HIGH' && 
      elapsed >= this.config.escalationThresholdsMs.highToEmergencyMs
    ) {
      state.currentPriority = 'EMERGENCY';
    }

    return state.currentPriority;
  }

  /**
   * Removes tracked threats from escalation buffers.
   */
  public resetThreat(threatKey: string): void {
    this.escalationMap.delete(threatKey);
  }

  public clear(): void {
    this.escalationMap.clear();
  }
}\n