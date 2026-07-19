import { UserActivity, IActivityState } from '../types/activity';
import { IActivityConfig } from '../config/activityConfig';

/**
 * Handles state stabilization, debouncing, and minimum hold duration mechanics
 * to prevent rapid, erratic flickering between raw activity classifications.
 */
export class ActivityStabilizer {
  private lastStabilizedActivity: UserActivity = 'UNKNOWN';
  private currentPendingActivity: UserActivity = 'UNKNOWN';
  private pendingStartTime: number = 0;
  private stabilizedStartTime: number = 0;

  constructor(private config: IActivityConfig) {}

  /**
   * Evaluates a raw classification against historical state timelines to output a stabilized state.
   */
  public stabilize(rawActivity: UserActivity, timestamp: number): IActivityState {
    if (this.stabilizedStartTime === 0) {
      this.stabilizedStartTime = timestamp;
      this.lastStabilizedActivity = rawActivity;
      this.currentPendingActivity = rawActivity;
      this.pendingStartTime = timestamp;
    }

    // 1. Manage Activity Shifting and Debounce Buffers
    if (rawActivity !== this.currentPendingActivity) {
      this.currentPendingActivity = rawActivity;
      this.pendingStartTime = timestamp;
    }

    const pendingDuration = timestamp - this.pendingStartTime;
    const currentHoldDuration = timestamp - this.stabilizedStartTime;
    const minHoldRequired = this.config.stabilization.minHoldDurationMs[this.lastStabilizedActivity] || 0;
    const debounceDelay = this.config.stabilization.debounceDelayMs;

    // 2. State Transition Validation Rules
    let targetActivity = this.lastStabilizedActivity;
    
    // Only permit a transition if the minimum hold is satisfied AND the new state passes debounce limits
    if (currentHoldDuration >= minHoldRequired && pendingDuration >= debounceDelay) {
      if (this.currentPendingActivity !== this.lastStabilizedActivity) {
        targetActivity = this.currentPendingActivity;
        this.stabilizedStartTime = timestamp;
      }
    }

    const finalDuration = timestamp - this.stabilizedStartTime;
    
    // Confidence calculation determined strictly by timeline consolidation factors
    const confidence = targetActivity === rawActivity ? 1.0 : 0.7;

    return {
      timestamp,
      currentActivity: targetActivity,
      confidence,
      durationInCurrentActivityMs: Math.max(0, finalDuration)
    };
  }

  /**
   * Reset tracking state variables back to initial conditions
   */
  public reset(): void {
    this.lastStabilizedActivity = 'UNKNOWN';
    this.currentPendingActivity = 'UNKNOWN';
    this.pendingStartTime = 0;
    this.stabilizedStartTime = 0;
  }
}