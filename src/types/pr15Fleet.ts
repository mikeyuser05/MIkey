/**
 * NOEXCUSE HPO V2 - PR15 Multi-Node Fleet Management Types
 */

import { EmergencyState, AlertEvaluationResult } from './pr11Triage';
import { GPSTelemetry } from './pr12Geo';

export interface FleetNodeStatus {
  nodeId: string;
  subjectName: string;
  assignedZone: string;
  emergencyState: EmergencyState;
  heartRate: number;
  spO2: number;
  gasPpm: number;
  batteryPercent: number;
  lastUpdated: number;
  activeAlerts: AlertEvaluationResult[];
  gps: GPSTelemetry;
}

export type RemoteCommandType = 'PING_BUZZER' | 'FORCE_MUTE' | 'TRIGGER_MANUAL_DISPATCH' | 'RESET_NODE';

export interface RemoteCommandPayload {
  targetNodeId: string;
  command: RemoteCommandType;
  issuedAt: number;
  operatorId: string;
}
