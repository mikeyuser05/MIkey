/**
 * NOEXCUSE HPO V2 - Fail-Safe Router Unit Tests
 */

import { FailSafeRouter } from '../services/escalation/failSafeRouter';
import { ConnectivityMonitor } from '../services/escalation/connectivityMonitor';
import { ActiveAlertRecord } from '../types/alertState';

describe('FailSafeRouter & ConnectivityMonitor', () => {
  let router: FailSafeRouter;
  let monitor: ConnectivityMonitor;

  beforeEach(() => {
    router = new FailSafeRouter();
    monitor = new ConnectivityMonitor();
    router.clearBuffer();
  });

  const mockAlertRecord = (threatLevel: any = 'T2_WARNING'): ActiveAlertRecord => ({
    alertId: 'ALT_12345',
    userId: 'user_1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    threatLevel,
    status: 'ACTIVE',
    primaryRiskFactor: 'SpO2',
    summaryMessage: 'Hypoxemia warning',
    timeToBreachSeconds: 45,
    acknowledgedBy: null,
    acknowledgedAt: null,
    channelStates: {} as any,
    escalationSequence: 0,
  });

  it('detects OFFLINE state when heartbeat times out', () => {
    const pastTime = Date.now() - 15000; // 15 seconds ago
    monitor.updateHeartbeat(pastTime);

    expect(monitor.getConnectivityState()).toBe('OFFLINE');
  });

  it('routes alerts locally and buffers for cloud sync when offline', () => {
    monitor.forceState('OFFLINE');
    const alert = mockAlertRecord('T2_WARNING');

    const result = router.handleDispatchFallback(alert);

    expect(result.routedLocally).toBe(true);
    expect(result.bufferedForSync).toBe(true);
    expect(result.localPathwaysActivated).toContain('ESP32_RECEIVER_HARDWARE_BUZZER');
    expect(router.getBufferedAlerts().length).toBe(1);
  });

  it('always activates local hardware pathways on T4_CRITICAL_EMERGENCY even if ONLINE', () => {
    monitor.forceState('ONLINE');
    const alert = mockAlertRecord('T4_CRITICAL_EMERGENCY');

    const result = router.handleDispatchFallback(alert);

    expect(result.routedLocally).toBe(true);
    expect(result.localPathwaysActivated).toContain('ESP32_RECEIVER_HARDWARE_BUZZER');
  });
});
