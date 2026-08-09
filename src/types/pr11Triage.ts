/**
 * NOEXCUSE HPO V2 - PR11 Smart Alert Triage & Emergency Types
 * Frozen/Extensible Alert Architecture Models
 */

export type AlertSeverity = 'LOW' | 'MODERATE' | 'CRITICAL';

export type AlertState = 
  | 'NORMAL'
  | 'WARNING'
  | 'ESCALATING'
  | 'EMERGENCY'
  | 'ACKNOWLEDGED'
  | 'RESOLVED'
  | 'SUPPRESSED';

export type DataQuality = 
  | 'VALID'
  | 'MISSING'
  | 'STALE'
  | 'INVALID'
  | 'SENSOR_ERROR'
  | 'COMMUNICATION_ERROR';

export type AlertCategory = 
  | 'PHYSIOLOGICAL_HR'
  | 'PHYSIOLOGICAL_SPO2'
  | 'ENVIRONMENTAL_GAS'
  | 'SYSTEM_TELEMETRY'
  | 'COMMUNICATION';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: 'PRIMARY_EMERGENCY' | 'SECONDARY_RELATIVE' | 'CAREGIVER' | 'OTHER';
  phone: string;
  isPrimary: boolean;
  enabled: boolean;
}

export interface EmergencyPreferences {
  emergencyCallingEnabled: boolean;
  autoEscalationTimeoutSeconds: number;
  contacts: EmergencyContact[];
  suppressionWindowMinutes: number;
}

export interface RawTelemetrySnapshot {
  heartRate?: number;
  spo2?: number;
  gasPpm?: number;
  timestamp: number;
  nodeId: string;
  sensorStatus?: string;
}

export interface AlertEvaluationResult {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  state: AlertState;
  quality: DataQuality;
  metricValue: number | null;
  thresholdValue: number | null;
  reason: string;
  detectedAt: number;
  durationMs: number;
  nodeId: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  eventType: 
    | 'EVENT_CREATED'
    | 'SEVERITY_CHANGED'
    | 'CONDITION_STARTED'
    | 'CONDITION_PERSISTED'
    | 'EMERGENCY_ENTERED'
    | 'ACKNOWLEDGED'
    | 'MUTED'
    | 'RESOLVED'
    | 'SIMULATED_ACTION_ATTEMPTED'
    | 'ACTION_RESULT';
  details: string;
  severity: AlertSeverity;
  nodeId: string;
  simulated: boolean;
}

// Legacy/Compatibility exports for PR15/PR16 and simulator services
export type TelemetrySnapshot = RawTelemetrySnapshot;
export type EmergencyState = AlertState;