/**
 * NOEXCUSE HPO V2 - Complete Real-Time Escalation & Fail-Safe Pipeline Controller
 * Coordinates PR7.1 Threat Evaluation, PR7.2 Dispatch/Ack, and PR7.3 Fail-Safe Routing.
 */

import { ComprehensiveHealthPacket } from '../types/pipeline';
import { ActiveAlertRecord } from '../../types/alertState';
import { AcknowledgmentRequest, AcknowledgmentResult } from '../../types/dispatch';
import { PipelineEscalationOutput, EscalationPipelineSummary } from '../../types/escalationPipeline';

import { threatEngine } from './threatEngine';
import { dispatchEngine } from './dispatchEngine';
import { acknowledgmentService } from './acknowledgmentService';
import { failSafeRouter } from './failSafeRouter';

export class EscalationPipeline {
  private activeAlertHistory: Map<string, ActiveAlertRecord> = new Map();

  /**
   * Main entry point: Ingests telemetry packet, evaluates threat, dispatches multi-channel alerts,
   * and handles fail-safe routing in case of offline/critical conditions.
   */
  public async processPacket(packet: ComprehensiveHealthPacket): Promise<PipelineEscalationOutput> {
    const alertRecord = threatEngine.evaluateThreat(packet);

    // 1. Process primary dispatches across registered channels
    const dispatchedAlert = await dispatchEngine.processDispatch(alertRecord);

    // 2. Process fail-safe local hardware routing & buffering if needed
    const failSafeResult = failSafeRouter.handleDispatchFallback(dispatchedAlert);

    this.activeAlertHistory.set(dispatchedAlert.alertId, dispatchedAlert);

    return {
      alertRecord: dispatchedAlert,
      failSafeResult,
      processedAt: Date.now(),
    };
  }

  /**
   * Acknowledge an ongoing alert and update state across dispatcher and local history.
   */
  public acknowledge(req: AcknowledgmentRequest): AcknowledgmentResult {
    const result = acknowledgmentService.acknowledgeAlert(req);
    if (result.success) {
      const updated = dispatchEngine.getActiveAlert(req.alertId);
      if (updated) {
        this.activeAlertHistory.set(updated.alertId, updated);
      }
    }
    return result;
  }

  /**
   * Returns pipeline operational metrics.
   */
  public getSummary(): EscalationPipelineSummary {
    const alerts = Array.from(this.activeAlertHistory.values());
    const unackCritical = alerts.filter(
      a => (a.threatLevel === 'T3_HIGH_PREDICTED_RISK' || a.threatLevel === 'T4_CRITICAL_EMERGENCY') &&
           a.status === 'ACTIVE'
    ).length;

    return {
      totalAlertsProcessed: this.activeAlertHistory.size,
      activeAlertsCount: alerts.filter(a => a.status === 'ACTIVE').length,
      unacknowledgedCriticals: unackCritical,
    };
  }

  public clearHistory(): void {
    this.activeAlertHistory.clear();
    dispatchEngine.clearAlerts();
    failSafeRouter.clearBuffer();
  }
}

export const escalationPipeline = new EscalationPipeline();
