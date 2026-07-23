/**
 * NOEXCUSE HPO V2 - Escalation Pipeline Types
 * Phase PR7.4: Complete Real-Time Escalation & Fail-Safe Pipeline Integration
 */

import { ActiveAlertRecord } from './alertState';
import { FailSafeDispatchResult } from './failsafe';
import { AcknowledgmentResult } from './dispatch';

export interface PipelineEscalationOutput {
  alertRecord: ActiveAlertRecord;
  failSafeResult: FailSafeDispatchResult;
  processedAt: number;
}

export interface EscalationPipelineSummary {
  totalAlertsProcessed: number;
  activeAlertsCount: number;
  unacknowledgedCriticals: number;
}
