/**
 * NOEXCUSE HPO V2: PR4.10.3 Memory Management & Subscription Validation Tracker
 * Strictly tracks, clean up, and validates active data stream allocations to prevent leaks.
 */

export interface ISubscriptionHandle {
  id: string;
  source: 'FIREBASE' | 'ESP_NOW_BRIDGE' | 'TELEMETRY_STREAM';
  unsubscribe: () => void;
  allocatedAt: number;
}

export class SubscriptionTracker {
  private activeSubscriptions = new Map<string, ISubscriptionHandle>();

  /**
   * Tracks an active subscription instance inside the localized dashboard layer.
   */
  public register(
    id: string,
    source: ISubscriptionHandle['source'],
    unsubscribe: () => void
  ): void {
    // Evict existing duplicate allocations cleanly before attaching a new listener
    if (this.activeSubscriptions.has(id)) {
      this.evict(id);
    }

    this.activeSubscriptions.set(id, {
      id,
      source,
      unsubscribe,
      allocatedAt: Date.now()
    });
  }

  /**
   * Evicts a single active data stream allocation, releasing its memory context.
   */
  public evict(id: string): boolean {
    const handle = this.activeSubscriptions.get(id);
    if (handle) {
      try {
        handle.unsubscribe();
      } catch (err) {
        // Fail-safe protection during dynamic disconnect operations
      }
      this.activeSubscriptions.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Clear all monitored network channels safely during unmount operations.
   */
  public releaseAll(): number {
    let clearedCount = 0;
    for (const id of Array.from(this.activeSubscriptions.keys())) {
      if (this.evict(id)) {
        clearedCount++;
      }
    }
    return clearedCount;
  }

  /**
   * Diagnostic structural lookup for validating leaked resource states.
   */
  public getActiveAllocationCount(): number {
    return this.activeSubscriptions.size;
  }
}\n