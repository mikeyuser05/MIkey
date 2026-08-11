import {
  CallDecision,
  EmergencyCallPolicy,
  CallCooldown,
  CallReasonCode,
  SafetyGateState,
} from '../types/triage';

export interface EvaluationInput {
  eventId: string;
  severity: 'NORMAL' | 'MODERATE' | 'CRITICAL';
  telemetryValid: boolean;
  sensorFaultState: boolean;
  eventFirstSeenTimestamp: number;
  currentTimestamp: number;
  policy: EmergencyCallPolicy;
  cooldown: CallCooldown;
  activeCallInProgress: boolean;
  isSuppressedOrMuted: boolean;
  lastProcessedEventId: string | null;
}

export class EmergencyCallSafetyGateService {
  private state: SafetyGateState = {
    policy: {
      callingEnabled: true,
      requiredPersistenceSeconds: 30,
      cooldownPeriodSeconds: 300,
      isMuted: false,
      primaryContact: {
        id: 'contact_01',
        name: 'Chief Medical Officer',
        phone: '+1-555-0199',
        relationship: 'Primary Responder',
        isPrimary: true,
      },
    },
    cooldown: {
      active: false,
      remainingSeconds: 0,
      lastCallTimestamp: null,
    },
    activeCallInProgress: false,
    lastDecision: null,
    simulationMode: true,
  };

  public evaluateCallEligibility(input: EvaluationInput): CallDecision {
    const {
      eventId,
      severity,
      telemetryValid,
      sensorFaultState,
      eventFirstSeenTimestamp,
      currentTimestamp,
      policy,
      cooldown,
      activeCallInProgress,
      isSuppressedOrMuted,
      lastProcessedEventId,
    } = input;

    const persistenceDurationMs = Math.max(0, currentTimestamp - eventFirstSeenTimestamp);
    const requiredPersistenceMs = policy.requiredPersistenceSeconds * 1000;

    // 1. Severity Gate (WARNING/MODERATE/NORMAL automatically fail)
    if (severity !== 'CRITICAL') {
      return this.buildDecision(
        'DO_NOT_CALL',
        'SEVERITY_NOT_CRITICAL',
        `Event severity is ${severity}. Only validated CRITICAL events are eligible for calling.`,
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 2. Telemetry Validity Gate
    if (!telemetryValid) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'TELEMETRY_INVALID',
        'Telemetry data integrity check failed or corrupted packet detected.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 3. Sensor Fault Gate
    if (sensorFaultState) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'SENSOR_FAULT_DETECTED',
        'Hardware sensor report indicates a fault state or disconnect.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 4. Calling Preference Global Toggle
    if (!policy.callingEnabled) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'CALLING_PREFERENCE_DISABLED',
        'Outbound emergency calling preference is explicitly disabled in settings.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 5. Emergency Contact Availability
    if (!policy.primaryContact || !policy.primaryContact.phone) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'NO_EMERGENCY_CONTACT',
        'No valid primary emergency contact configured in dispatch roster.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 6. Suppression / Mute Gate
    if (policy.isMuted || isSuppressedOrMuted) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'SUPPRESSED_OR_MUTED',
        'Emergency alerts are actively muted or suppressed by operational dispatch.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 7. Active Call in Progress Gate
    if (activeCallInProgress) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'ACTIVE_CALL_IN_PROGRESS',
        'An emergency call session is currently active. Duplicate outbound trigger blocked.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 8. Cooldown Window Gate
    if (cooldown.active) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'COOLDOWN_ACTIVE',
        `Safety gate in cooldown period. ${cooldown.remainingSeconds}s remaining before next dispatch attempt allowed.`,
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 9. Event Persistence Gate
    if (persistenceDurationMs < requiredPersistenceMs) {
      const remainingSec = Math.ceil((requiredPersistenceMs - persistenceDurationMs) / 1000);
      return this.buildDecision(
        'DO_NOT_CALL',
        'PERSISTENCE_DURATION_INSUFFICIENT',
        `CRITICAL event has persisted for ${Math.floor(persistenceDurationMs / 1000)}s. Requires ${policy.requiredPersistenceSeconds}s continuous validation (${remainingSec}s remaining).`,
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // 10. Duplicate Event Protection Gate
    if (lastProcessedEventId === eventId) {
      return this.buildDecision(
        'DO_NOT_CALL',
        'DUPLICATE_EVENT_PROTECTION',
        'Event ID already processed in current safety gate window.',
        currentTimestamp,
        eventId,
        severity,
        persistenceDurationMs
      );
    }

    // ALL SAFETY CONDITIONS PASSED -> CALL_ELIGIBLE
    return this.buildDecision(
      'CALL_ELIGIBLE',
      'ALL_SAFETY_CONDITIONS_PASSED',
      `Validated CRITICAL event persisted for ${Math.floor(persistenceDurationMs / 1000)}s and passed all 9 safety conditions. Safe for dispatch simulation.`,
      currentTimestamp,
      eventId,
      severity,
      persistenceDurationMs
    );
  }

  private buildDecision(
    status: 'CALL_ELIGIBLE' | 'DO_NOT_CALL',
    reasonCode: CallReasonCode,
    reasonExplanation: string,
    evaluatedAt: number,
    eventId: string,
    severity: 'NORMAL' | 'MODERATE' | 'CRITICAL',
    persistenceDurationMs: number
  ): CallDecision {
    const decision: CallDecision = {
      status,
      reasonCode,
      reasonExplanation,
      evaluatedAt,
      eventId,
      severity,
      persistenceDurationMs,
    };
    this.state.lastDecision = decision;
    return decision;
  }

  public getState(): SafetyGateState {
    return { ...this.state };
  }

  public updatePolicy(updates: Partial<EmergencyCallPolicy>): void {
    this.state.policy = { ...this.state.policy, ...updates };
  }

  public setMuteState(muted: boolean): void {
    this.state.policy.isMuted = muted;
  }

  public triggerCooldown(durationSeconds: number = 300): void {
    this.state.cooldown = {
      active: true,
      remainingSeconds: durationSeconds,
      lastCallTimestamp: Date.now(),
    };
  }

  public clearCooldown(): void {
    this.state.cooldown = {
      active: false,
      remainingSeconds: 0,
      lastCallTimestamp: null,
    };
  }
}

export const pr24SafetyGateService = new EmergencyCallSafetyGateService();
