/**
 * NOEXCUSE HPO V2 - Dispatch Engine Types
 * Phase PR7.2: Multi-Channel Real-Time Dispatch & Acknowledgment Engine
 */

import { DispatchTargetChannel } from './threatMatrix';
import { ActiveAlertRecord } from './alertState';

export interface ChannelAdapterResponse {
  channel: DispatchTargetChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IChannelAdapter {
  channel: DispatchTargetChannel;
  dispatch(alert: ActiveAlertRecord): Promise<ChannelAdapterResponse>;
}

export interface AcknowledgmentRequest {
  alertId: string;
  userId: string;
  acknowledgedBy: string; // User ID or Operator ID
  timestamp: number;
  note?: string;
}

export interface AcknowledgmentResult {
  alertId: string;
  success: boolean;
  status: 'ACKNOWLEDGED' | 'ALREADY_ACKNOWLEDGED' | 'ALERT_NOT_FOUND';
  acknowledgedAt: number;
}
