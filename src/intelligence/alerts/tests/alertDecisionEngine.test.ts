import { AlertDecisionEngine } from '../engine/alertDecisionEngine';
import { evaluateAlertRules } from '../engine/alertRuleEngine';
import { determineAlertPriority } from '../engine/priorityEngine';
import { IAlertConfig } from '../config/alertConfig';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.5 Alert Decision Engine - Automated Test Suite', () => {
  let engine: AlertDecisionEngine;

  const mockConfig: IAlertConfig = {
    cooldownPeriodsMs: {
      NONE: 0,
      INFO: 10000,
      WARNING: 10000,
      HIGH: 5000,
      EMERGENCY: 2000
    },
    escalationThresholdsMs: {
      warningToHighMs: 5000,
      highToEmergencyMs: 5000
    }
  };

  beforeEach(() => {
    engine = new AlertDecisionEngine(mockConfig);
  });

  test('Alert Rule Eligibility: Transient spikes are suppressed from dispatching alerts', () => {
    const telemetry = { heartRate: 145, spo2: 98, gas: 100 };
    const activity = { currentActivity: 'SITTING', confidence: 0.95 };
    const riskTransient = {
      overallSeverity: 'CRITICAL',
      isTransientSpike: true,
      activeRisks: [{ category: 'CARDIOVASCULAR', sourceRules: ['CRITICAL_TACHYCARDIA_THRESHOLD_EXCEEDED'] }]
    };

    const result = evaluateAlertRules(telemetry, activity, riskTransient);
    expect(result.isEligible).toBe(false);
  });

  test('Priority Matrix Mapping: Assigns strict structural classifications based on danger vectors', () => {
    const p1 = determineAlertPriority('ENVIRONMENTAL', 'CRITICAL', ['CRITICAL_ENVIRONMENTAL_LETHAL_GAS_BREACH']);
    const p2 = determineAlertPriority('HEALTH', 'HIGH', ['TACHYCARDIA_THRESHOLD_EXCEEDED']);
    const p3 = determineAlertPriority('HEALTH', 'MEDIUM', ['BRADYCARDIA_THRESHOLD_BREACHED']);

    expect(p1).toBe('EMERGENCY');
    expect(p2).toBe('HIGH');
    expect(p3).toBe('WARNING');
  });

  test('Deduplication, Cooldown, and Escalation: Processes state transitions across temporal metrics', () => {
    const baseTime = 1710000000000;
    
    const telemetry = { heartRate: 115, spo2: 95, gas: 100 };
    const activity = { currentActivity: 'SITTING', confidence: 0.90 };
    const trends = { heartRate: { direction: 'RISING' }, spo2: { direction: 'STABLE' } };
    const riskStatus = {
      overallSeverity: 'MEDIUM',
      isTransientSpike: false,
      activeRisks: [{ category: 'CARDIOVASCULAR', sourceRules: ['TACHYCARDIA_THRESHOLD_EXCEEDED'] }]
    };

    // Frame 1: Initial creation of Warning level Alert payload
    const alert1 = engine.processAlertEvaluation(telemetry, activity, trends, riskStatus, baseTime);
    expect(alert1).not.toBeNull();
    expect(alert1?.priority).toBe('WARNING');
    expect(alert1?.escalationCount).toBe(0);

    // Frame 2 (2000ms later): Throttled due to ongoing Cooldown window mapping
    const alert2 = engine.processAlertEvaluation(telemetry, activity, trends, riskStatus, baseTime + 2000);
    expect(alert2).toBeNull();

    // Frame 3 (6000ms later): Past escalation barrier (5000ms), priority shifts to HIGH, bypassing Warning cooldown
    const alert3 = engine.processAlertEvaluation(telemetry, activity, trends, riskStatus, baseTime + 6000);
    expect(alert3).not.toBeNull();
    expect(alert3?.priority).toBe('HIGH');
    expect(alert3?.escalationCount).toBe(1);
  });
});