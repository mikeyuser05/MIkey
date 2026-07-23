/**
 * NOEXCUSE HPO V2 - Dispatch Engine Unit Tests
 */

import { DispatchEngine } from '../services/escalation/dispatchEngine';
import { AcknowledgmentService } from '../services/escalation/acknowledgmentService';
import { ThreatEngine } from '../services/escalation/threatEngine';
import { ComprehensiveHealthPacket } from '../types/pipeline';
import { IChannelAdapter } from '../types/dispatch';

describe('DispatchEngine & AcknowledgmentService', () => {
  let dispatch: DispatchEngine;
  let threat: ThreatEngine;
  let ackService: AcknowledgmentService;

  beforeEach(() => {
    dispatch = new DispatchEngine();
    threat = new ThreatEngine();
    ackService = new AcknowledgmentService();
    dispatch.clearAlerts();
  });

  const mockCriticalPacket = (): ComprehensiveHealthPacket => ({
    timestamp: Date.now(),
    userId: 'user_1',
    sqiPacket: { sqi: { isUsableForBaselines: true } } as any,
    deviationState: {} as any,
    riskScore: { overallScore: 95, dominantRiskFactor: 'SpO2', summaryExplanation: 'Critical Risk' } as any,
    trendResult: {} as any,
    earlyWarning: { alertLevel: 'CRITICAL_PREDICTED', summaryWarning: 'Imminent breach' } as any,
  });

  it('dispatches active alerts across enabled channels successfully', async () => {
    const alertRecord = threat.evaluateThreat(mockCriticalPacket());

    const mockPushAdapter: IChannelAdapter = {
      channel: 'MOBILE_PUSH',
      dispatch: async () => ({ channel: 'MOBILE_PUSH', success: true, messageId: 'msg_123' }),
    };

    dispatch.registerAdapter(mockPushAdapter);
    const updatedAlert = await dispatch.processDispatch(alertRecord);

    expect(updatedAlert.channelStates.MOBILE_PUSH.status).toBe('SENT');
    expect(updatedAlert.channelStates.MOBILE_PUSH.deliveredAt).not.toBeNull();
  });

  it('handles user acknowledgment and transitions channel statuses to ACKNOWLEDGED', async () => {
    const alertRecord = threat.evaluateThreat(mockCriticalPacket());
    await dispatch.processDispatch(alertRecord);

    const ackResult = ackService.acknowledgeAlert({
      alertId: alertRecord.alertId,
      userId: 'user_1',
      acknowledgedBy: 'operator_admin',
      timestamp: Date.now(),
    });

    expect(ackResult.status).toBe('ACKNOWLEDGED');

    const activeAlert = dispatch.getActiveAlert(alertRecord.alertId);
    expect(activeAlert?.status).toBe('ACKNOWLEDGED');
    expect(activeAlert?.acknowledgedBy).toBe('operator_admin');
    expect(activeAlert?.channelStates.MOBILE_PUSH.status).toBe('ACKNOWLEDGED');
  });
});
