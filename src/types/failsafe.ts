/**
 * NOEXCUSE HPO V2 - Fail-Safe & Connectivity Types
 * Phase PR7.3: Offline Fallback & Local Resilience Fail-Safe Router
 */

export type ConnectivityState = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface LocalFailSafeRouteConfig {
  enableLocalBuzzerOverride: boolean;
  enableLocalStorageBuffer: boolean;
  maxBufferRecordCount: number;
  localBroadcastPort: number;
}

export interface FailSafeDispatchResult {
  alertId: string;
  routedLocally: boolean;
  localPathwaysActivated: string[];
  bufferedForSync: boolean;
  timestamp: number;
}
