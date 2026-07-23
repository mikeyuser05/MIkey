/**
 * NOEXCUSE HPO V2 - Offline Fallback & Local Resilience Fail-Safe Router
 * Intercepts dispatches when offline to ensure local hardware buzzers and alarms trigger without cloud latency.
 */

import { ActiveAlertRecord } from '../../types/alertState';
import { ConnectivityState, FailSafeDispatchResult, LocalFailSafeRouteConfig } from '../../types/failsafe';
import { connectivityMonitor } from './connectivityMonitor';

export class FailSafeRouter {
  private localBuffer: ActiveAlertRecord[] = [];
  private config: LocalFailSafeRouteConfig = {
    enableLocalBuzzerOverride: true,
    enableLocalStorageBuffer: true,
    maxBufferRecordCount: 500,
    localBroadcastPort: 8088,
  };

  /**
   * Routes alert to local hardware fallback paths if offline or cloud dispatch fails.
   */
  public handleDispatchFallback(alert: ActiveAlertRecord): FailSafeDispatchResult {
    const connState = connectivityMonitor.getConnectivityState();
    const activatedPathways: string[] = [];
    let routedLocally = false;
    let bufferedForSync = false;

    if (connState === 'OFFLINE' || connState === 'DEGRADED' || alert.threatLevel === 'T4_CRITICAL_EMERGENCY') {
      // Activate local buzzer & visual warning regardless of cloud state for T4 or offline
      if (this.config.enableLocalBuzzerOverride) {
        activatedPathways.push('ESP32_RECEIVER_HARDWARE_BUZZER');
        activatedPathways.push('LOCAL_DASHBOARD_AUDIO_BEACON');
        routedLocally = true;
      }

      // Buffer alert locally for cloud sync when connection restores
      if (this.config.enableLocalStorageBuffer) {
        this.bufferAlertLocally(alert);
        bufferedForSync = true;
      }
    }

    return {
      alertId: alert.alertId,
      routedLocally,
      localPathwaysActivated: activatedPathways,
      bufferedForSync,
      timestamp: Date.now(),
    };
  }

  private bufferAlertLocally(alert: ActiveAlertRecord): void {
    if (this.localBuffer.length >= this.config.maxBufferRecordCount) {
      this.localBuffer.shift(); // Evict oldest record
    }
    this.localBuffer.push(alert);
  }

  public getBufferedAlerts(): ActiveAlertRecord[] {
    return [...this.localBuffer];
  }

  public clearBuffer(): void {
    this.localBuffer = [];
  }
}

export const failSafeRouter = new FailSafeRouter();
