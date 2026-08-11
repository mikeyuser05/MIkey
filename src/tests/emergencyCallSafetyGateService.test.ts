import { EmergencyCallSafetyGateService, EvaluationInput } from '../services/emergencyCallSafetyGateService';
import { EmergencyCallPolicy } from '../types/triage';

describe('PR24 — Emergency Call Safety Gate Rule Evaluation', () => {
  let gateService: EmergencyCallSafetyGateService;
  let basePolicy: EmergencyCallPolicy;
  let baseInput: EvaluationInput;

  beforeEach(() => {
    gateService = new EmergencyCallSafetyGateService();
    basePolicy = {
      callingEnabled: true,
      requiredPersistenceSeconds: 30,
      cooldownPeriodSeconds: 300,
      isMuted: false,
      primaryContact: {
        id: 'c1',
        name: 'Dispatch Center',
        phone: '+15550199',
        relationship: 'HQ',
        isPrimary: true,
      },
    };

    const now = 100000;
    baseInput = {
      eventId: 'evt_001',
      severity: 'CRITICAL',
      telemetryValid: true,
      sensorFaultState: false,
      eventFirstSeenTimestamp: now - 35000, // 35s ago (> 30s threshold)
      currentTimestamp: now,
      policy: basePolicy,
      cooldown: { active: false, remainingSeconds: 0, lastCallTimestamp: null },
      activeCallInProgress: false,
      isSuppressedOrMuted: false,
      lastProcessedEventId: null,
    };
  });

  test('Valid CRITICAL event persisting > 30s evaluates to CALL_ELIGIBLE', () => {
    const decision = gateService.evaluateCallEligibility(baseInput);
    expect(decision.status).toBe('CALL_ELIGIBLE');
    expect(decision.reasonCode).toBe('ALL_SAFETY_CONDITIONS_PASSED');
  });

  test('NORMAL severity evaluates to DO_NOT_CALL', () => {
    const input = { ...baseInput, severity: 'NORMAL' as const };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('SEVERITY_NOT_CRITICAL');
  });

  test('MODERATE severity evaluates to DO_NOT_CALL', () => {
    const input = { ...baseInput, severity: 'MODERATE' as const };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('SEVERITY_NOT_CRITICAL');
  });

  test('CRITICAL event with insufficient persistence duration (< 30s) evaluates to DO_NOT_CALL', () => {
    const now = 100000;
    const input = {
      ...baseInput,
      eventFirstSeenTimestamp: now - 15000, // 15 seconds ago
      currentTimestamp: now,
    };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('PERSISTENCE_DURATION_INSUFFICIENT');
  });

  test('Calling preference disabled evaluates to DO_NOT_CALL', () => {
    const input = {
      ...baseInput,
      policy: { ...basePolicy, callingEnabled: false },
    };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('CALLING_PREFERENCE_DISABLED');
  });

  test('Missing primary emergency contact evaluates to DO_NOT_CALL', () => {
    const input = {
      ...baseInput,
      policy: { ...basePolicy, primaryContact: null },
    };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('NO_EMERGENCY_CONTACT');
  });

  test('Active mute state evaluates to DO_NOT_CALL', () => {
    const input = {
      ...baseInput,
      policy: { ...basePolicy, isMuted: true },
    };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('SUPPRESSED_OR_MUTED');
  });

  test('Active call in progress evaluates to DO_NOT_CALL', () => {
    const input = { ...baseInput, activeCallInProgress: true };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('ACTIVE_CALL_IN_PROGRESS');
  });

  test('Active cooldown window evaluates to DO_NOT_CALL', () => {
    const input = {
      ...baseInput,
      cooldown: { active: true, remainingSeconds: 120, lastCallTimestamp: Date.now() },
    };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('COOLDOWN_ACTIVE');
  });

  test('Corrupted telemetry data evaluates to DO_NOT_CALL', () => {
    const input = { ...baseInput, telemetryValid: false };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('TELEMETRY_INVALID');
  });

  test('Sensor hardware fault state evaluates to DO_NOT_CALL', () => {
    const input = { ...baseInput, sensorFaultState: true };
    const decision = gateService.evaluateCallEligibility(input);
    expect(decision.status).toBe('DO_NOT_CALL');
    expect(decision.reasonCode).toBe('SENSOR_FAULT_DETECTED');
  });
});
