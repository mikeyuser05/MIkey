/**
 * NOEXCUSE HPO V2 - Connectivity Monitor
 * Monitors real-time cloud accessibility and heartbeat latency.
 */

import { ConnectivityState } from '../../types/failsafe';

export class ConnectivityMonitor {
  private currentState: ConnectivityState = 'ONLINE';
  private lastHeartbeatTs: number = Date.now();
  private heartbeatTimeoutMs: number = 10000; // 10s default timeout

  public updateHeartbeat(timestamp: number = Date.now()): void {
    this.lastHeartbeatTs = timestamp;
    this.currentState = 'ONLINE';
  }

  public forceState(state: ConnectivityState): void {
    this.currentState = state;
  }

  public getConnectivityState(): ConnectivityState {
    const now = Date.now();
    if (this.currentState === 'OFFLINE') return 'OFFLINE';

    if (now - this.lastHeartbeatTs > this.heartbeatTimeoutMs) {
      return 'OFFLINE';
    }
    if (now - this.lastHeartbeatTs > 5000) {
      return 'DEGRADED';
    }

    return 'ONLINE';
  }
}

export const connectivityMonitor = new ConnectivityMonitor();
