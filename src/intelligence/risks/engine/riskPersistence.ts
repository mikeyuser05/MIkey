import { RiskSeverity } from '../types/risks';
import { IRiskConfig } from '../config/riskConfig';

export interface IRiskPersistenceState {
  firstSeenTimestamp: number;
  lastSeenTimestamp: number;
}

/**
 * Pure deterministic state analyzer evaluating continuous duration windows
 * to filter out random sensor spikes or transient telemetry packet anomalies.
 */
export class RiskPersistenceTracker {
  private historyMap: Map<string, IRiskPersistenceState> = new Map();
  private config: IRiskConfig;

  constructor(config: IRiskConfig) {
    this.config = config;
  }

  /**
   * Tracks and returns true if the given severity hazard has been observed
   * continuously for a period less than its defined configuration persistence window limit.
   */
  public checkTransientSpike(
    ruleKey: string,
    currentSeverity: RiskSeverity,
    currentTimestamp: number
  ): boolean {
    if (currentSeverity === 'NONE') {
      this.historyMap.delete(ruleKey);
      return false;
    }

    const targetDuration = this.config.persistenceWindowsMs[currentSeverity] || 0;
    const existingState = this.historyMap.get(ruleKey);

    if (!existingState) {
      this.historyMap.set(ruleKey, {
        firstSeenTimestamp: currentTimestamp,
        lastSeenTimestamp: currentTimestamp
      });
      // It is transient until the duration between first seen and current passes target duration
      return targetDuration > 0;
    }

    // Update last seen tracking parameter
    existingState.lastSeenTimestamp = currentTimestamp;
    const contiguousDurationMs = currentTimestamp - existingState.firstSeenTimestamp;

    if (contiguousDurationMs >= targetDuration) {
      return false; // Verified sustained structural risk breach
    }

    return true; // Still within transient filter duration window
  }

  /**
   * Clears tracked persistence timelines.
   */
  public clear(): void {
    this.historyMap.clear();
  }
}\n