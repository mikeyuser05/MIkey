import { AlertPriority } from '../types/alerts';
import { IAlertConfig } from '../config/alertConfig';

/**
 * Pure deterministic state manager that handles throttle windows per alert categorization profile.
 * Prevents telemetry packet flooding without modifying external databases or runtime repositories.
 */
export class CooldownTracker {
  private lastFiredMap: Map<string, number> = new Map();
  private config: IAlertConfig;

  constructor(config: IAlertConfig) {
    this.config = config;
  }

  /**
   * Evaluates if a given category composite key is locked within its configured cooldown frame.
   */
  public isCoolingDown(categoryKey: string, priority: AlertPriority, currentTimestamp: number): boolean {
    const lastFired = this.lastFiredMap.get(categoryKey);
    if (lastFired === undefined) {
      return false;
    }

    const cooldownPeriod = this.config.cooldownPeriodsMs[priority] || 0;
    return currentTimestamp - lastFired < cooldownPeriod;
  }

  /**
   * Logs or updates the dispatch milestone anchor for the specific operational metric vector.
   */
  public recordDispatch(categoryKey: string, currentTimestamp: number): void {
    this.lastFiredMap.set(categoryKey, currentTimestamp);
  }

  /**
   * Flushes active cache tables back to standard startup values.
   */
  public clear(): void {
    this.lastFiredMap.clear();
  }
}