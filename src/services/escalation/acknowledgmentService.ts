/**
 * NOEXCUSE HPO V2 - Alert Acknowledgment Service
 * Manages acknowledgment lifecycle state transitions, silencing alarms, and auto-escalation locks.
 */

import { ActiveAlertRecord } from '../../types/alertState';
import { AcknowledgmentRequest, AcknowledgmentResult } from '../../types/dispatch';
import { dispatchEngine } from './dispatchEngine';

export class AcknowledgmentService {
  /**
   * Processes a manual user/operator acknowledgment token.
   */
  public acknowledgeAlert(req: AcknowledgmentRequest): AcknowledgmentResult {
    const alert = dispatchEngine.getActiveAlert(req.alertId);

    if (!alert) {
      return {
        alertId: req.alertId,
        success: false,
        status: 'ALERT_NOT_FOUND',
        acknowledgedAt: Date.now(),
      };
    }

    if (alert.status === 'ACKNOWLEDGED' || alert.status === 'RESOLVED') {
      return {
        alertId: req.alertId,
        success: true,
        status: 'ALREADY_ACKNOWLEDGED',
        acknowledgedAt: alert.acknowledgedAt || Date.now(),
      };
    }

    const now = req.timestamp || Date.now();
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = req.acknowledgedBy;
    alert.acknowledgedAt = now;
    alert.updatedAt = now;

    // Mark all pending/sent channel states as acknowledged
    Object.values(alert.channelStates).forEach(chState => {
      if (chState.status === 'SENT' || chState.status === 'PENDING') {
        chState.acknowledgedAt = now;
        chState.status = 'ACKNOWLEDGED';
      }
    });

    return {
      alertId: req.alertId,
      success: true,
      status: 'ACKNOWLEDGED',
      acknowledgedAt: now,
    };
  }
}

export const acknowledgmentService = new AcknowledgmentService();
