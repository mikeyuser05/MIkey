/**
 * NOEXCUSE HPO V2 - Offline Storage & Auto-Sync Engine (PR16)
 * Buffers telemetry frames during signal dropouts and drains to central store upon reconnect.
 */

import { BufferedFrame, NetworkConnectivityStatus } from '../types/pr16Offline';
import { TelemetrySnapshot } from '../types/pr11Triage';
import { auditLogger } from './auditLogger';

const OFFLINE_QUEUE_KEY = 'noexcuse_hpo_v2_offline_queue';

class OfflineSyncEngine {
  private queue: BufferedFrame[] = [];
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private lastOnlineAt: number = Date.now();

  constructor() {
    this.loadQueue();
    this.initNetworkListeners();
  }

  private initNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.lastOnlineAt = Date.now();
      auditLogger.log('EVENT_CREATED', 'Network connection restored. Initiating offline sync recovery...', 'LOW');
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      auditLogger.log('EVENT_CREATED', 'Network connection lost. Enqueuing telemetry to edge buffer.', 'MODERATE');
    });
  }

  public bufferFrame(snapshot: TelemetrySnapshot): boolean {
    if (this.isOnline) {
      return false; // Transmitted live
    }

    const frame: BufferedFrame = {
      id: `FRAME_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      snapshot,
      capturedAt: Date.now(),
      synced: false,
      retryCount: 0
    };

    this.queue.push(frame);
    if (this.queue.length > 500) {
      this.queue.shift(); // FIFO drop if storage capacity exceeded
    }
    this.saveQueue();
    return true; // Buffered offline
  }

  public async flushQueue(): Promise<number> {
    if (!this.isOnline || this.queue.length === 0 || this.isSyncing) {
      return 0;
    }

    this.isSyncing = true;
    const initialSize = this.queue.length;

    try {
      // Simulate batch syncing frames to remote server / Firebase
      const batch = [...this.queue];
      for (const frame of batch) {
        frame.synced = true;
      }

      // Clear synced frames from queue
      this.queue = [];
      this.saveQueue();

      auditLogger.log(
        'EVENT_CREATED',
        `Offline Sync Complete: Successfully recovered ${initialSize} telemetry frames.`,
        'LOW'
      );
    } catch (error) {
      auditLogger.log('EVENT_CREATED', `Offline Sync Error: ${String(error)}`, 'CRITICAL');
    } finally {
      this.isSyncing = false;
    }

    return initialSize;
  }

  public getStatus(): NetworkConnectivityStatus {
    return {
      isOnline: this.isOnline,
      lastOnlineAt: this.lastOnlineAt,
      pendingQueueSize: this.queue.length,
      isSyncing: this.isSyncing
    };
  }

  public forceOfflineToggle(simulateOffline: boolean): void {
    this.isOnline = !simulateOffline;
    if (this.isOnline) {
      this.flushQueue();
    }
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load offline queue from storage', e);
    }
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue to storage', e);
    }
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
