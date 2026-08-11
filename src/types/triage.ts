export type CallEligibilityStatus = 'CALL_ELIGIBLE' | 'DO_NOT_CALL';

export type CallReasonCode =
  | 'SEVERITY_NOT_CRITICAL'
  | 'TELEMETRY_INVALID'
  | 'SENSOR_FAULT_DETECTED'
  | 'PERSISTENCE_DURATION_INSUFFICIENT'
  | 'CALLING_PREFERENCE_DISABLED'
  | 'NO_EMERGENCY_CONTACT'
  | 'SUPPRESSED_OR_MUTED'
  | 'ACTIVE_CALL_IN_PROGRESS'
  | 'COOLDOWN_ACTIVE'
  | 'DUPLICATE_EVENT_PROTECTION'
  | 'ALL_SAFETY_CONDITIONS_PASSED';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface EmergencyCallPolicy {
  callingEnabled: boolean;
  requiredPersistenceSeconds: number; // e.g. 30s
  cooldownPeriodSeconds: number;       // e.g. 300s
  isMuted: boolean;
  primaryContact: EmergencyContact | null;
}

export interface CallCooldown {
  active: boolean;
  remainingSeconds: number;
  lastCallTimestamp: number | null;
}

export interface CallDecision {
  status: CallEligibilityStatus;
  reasonCode: CallReasonCode;
  reasonExplanation: string;
  evaluatedAt: number;
  eventId: string | null;
  severity: 'NORMAL' | 'MODERATE' | 'CRITICAL';
  persistenceDurationMs: number;
}

export interface SafetyGateState {
  policy: EmergencyCallPolicy;
  cooldown: CallCooldown;
  activeCallInProgress: boolean;
  lastDecision: CallDecision | null;
  simulationMode: boolean;
}
