import { IRecommendationConfig } from '../config/recommendationConfig';

/**
 * Pure deterministic state tracking node for recommendations.
 * Prevents rapid cyclical flapping of advice across telemetric packets.
 */
export class RecCooldownTracker {
  private lastIssuedMap: Map<string, number> = new Map();
  private config: IRecommendationConfig;

  constructor(config: IRecommendationConfig) {
    this.config = config;
  }

  /**
   * Checks if a recommendation code is currently locked under a cooldown window.
   */
  public isCoolingDown(code: string, currentTimestamp: number): boolean {
    const lastIssued = this.lastIssuedMap.get(code);
    if (lastIssued === undefined) {
      return false;
    }

    const cooldownPeriod = this.config.cooldownPeriodsMs[code] || 0;
    return currentTimestamp - lastIssued < cooldownPeriod;
  }

  /**
   * Tracks the issuance of a specific recommendation to lock its cooldown window.
   */
  public recordIssuance(code: string, currentTimestamp: number): void {
    this.lastIssuedMap.set(code, currentTimestamp);
  }

  /**
   * Flushes active cache state tables back to baseline.
   */
  public clear(): void {
    this.lastIssuedMap.clear();
  }
}