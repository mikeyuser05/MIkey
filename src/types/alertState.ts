import { AlertSeverity, AlertState } from './pr11Triage';

export interface ActiveAlertRecord {
  id: string;
  nodeId: string;
  severity: AlertSeverity;
  state: AlertState;
  detectedAt: number;
  message?: string;
  acknowledgedAt?: number;
  status?: string;
}