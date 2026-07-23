/**
 * NOEXCUSE HPO V2 - Complete Escalation Pipeline Integration Unit Tests
 */

import { EscalationPipeline } from '../services/escalation/escalationPipeline';
import { ComprehensiveHealthPacket } from '../types/pipeline';
import { connectivityMonitor } from '../services/escalation/connectivityMonitor';

describe('EscalationPipeline (PR7.4 Complete Integration)', () => {
  let pipeline: EscalationPipeline;

  beforeEach(() => {
    pipeline = new EscalationPipeline();
    pipeline.clearHistory();
    connectivityMonitor.forceState('ONLINE');
  });

  const mockCriticalPacket = (): ComprehensiveHealthPacket => ({
    timestamp: Date.now(),
    userId: 'user_1',
    sqiPacket: { sqi: { isUsableForBaselines: true } } as any,
    deviationState: {} as any,
    riskScore: { overallScore: 92, dominantRiskFactor: 'SpO2', summaryExplanation: 'Severe Hypoxemia' } as any,
    trendResult: {} as any,
    earlyWarning: { alertLevel: 'CRITICAL_PREDICTED', summaryWarning: 'Imminent breach' } as any,
  });

  it('runs end-to-end packet processing from evaluation to dispatch and fail-safe check', async () => {
    const packet = mockCriticalPacket();
    const output = await pipeline.processPacket(packet);

    expect(output.alertRecord.threatLevel).toBe('T4_CRITICAL_EMERGENCY');
    expect(output.alertRecord.status).toBe('ACTIVE');
    expect(output.failSafeResult.routedLocally).toBe(true);
    expect(output.failSafeResult.localPathwaysActivated).toContain('ESP32_RECEIVER_HARDWARE_BUZZER');

    const summary = pipeline.getSummary();
    expect(summary.totalAlertsProcessed).toBe(1);
    expect(summary.unacknowledgedCriticals).toBe(1);
  });

  it('handles operator acknowledgment and updates pipeline metrics correctly', async () => {
    const packet = mockCriticalPacket();
    const output = await pipeline.processPacket(packet);

    const ackResult = pipeline.acknowledge({
      alertId: output.alertRecord.alertId,
      userId: 'user_1',
      acknowledgedBy: 'medical_operator',
      timestamp: Date.now(),
    });

    expect(ackResult.success).toBe(true);
    expect(ackResult.status).toBe('ACKNOWLEDGED');

    const summary = pipeline.getSummary();
    expect(summary.unacknowledgedCriticals).toBe(0);
    expect(summary.activeAlertsCount).toBe(0);
  });
});
