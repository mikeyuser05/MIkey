/**
 * NOEXCUSE HPO V2 - PR16 Offline Storage & Sync Types
 */

import { TelemetrySnapshot } from './pr11Triage';

export interface BufferedFrame {
  id: string;
  snapshot: TelemetrySnapshot;
  capturedAt: number;
  synced: boolean;
  retryCount: number;
}

export interface NetworkConnectivityStatus {
  isOnline: boolean;
  effectiveType?: string;
  lastOnlineAt: number;
  pendingQueueSize: number;
  isSyncing: boolean;
}
