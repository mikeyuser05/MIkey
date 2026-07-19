import { RecommendationEngine } from '../engine/recommendationEngine';
import { evaluateRecommendationRules } from '../engine/recGenerationEngine';
import { rankRecommendations } from '../engine/rankingEngine';
import { resolveRecommendationConflicts } from '../engine/conflictResolution';
import { IRecommendationConfig } from '../config/recommendationConfig';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.6 Recommendation Engine - Automated Test Suite', () => {
  let engine: RecommendationEngine;

  const mockConfig: IRecommendationConfig = {
    cooldownPeriodsMs: {
      'REC_GAS_EVACUATE': 5000,
      'REC_FALL_EMERGENCY': 5000,
      'REC_TACHY_REST': 5000
    },
    priorityWeights: {
      'INFO': 1,
      'PREVENTIVE': 2,
      'ACTION_REQUIRED': 3,
      'EMERGENCY_ACTION': 4
    }
  };

  beforeEach(() => {
    engine = new RecommendationEngine(mockConfig);
  });

  test('Rule-Based Engine: Suppresses output during transient spikes', () => {
    const telemetry = { heartRate: 145, spo2: 95, gas: 100 };
    const activity = { currentActivity: 'RUNNING', confidence: 0.90 };
    const trends = { heartRate: { direction: 'RISING' }, spo2: { direction: 'STABLE' } };
    const riskTransient = { overallSeverity: 'HIGH', isTransientSpike: true };
    const alert = { priority: 'HIGH', triggerRules: ['TACHYCARDIA_THRESHOLD_EXCEEDED'] };

    const recs = evaluateRecommendationRules(telemetry, activity, trends, riskTransient, alert);
    expect(recs.length).toBe(0);
  });

  test('Priority Ranking: Arranges generated output descending by weight configurations', () => {
    const unranked = [
      { id: '', code: 'REC_BRADY_WARMUP', priority: 'PREVENTIVE' as const, actionItem: '', rationale: '' },
      { id: '', code: 'REC_GAS_EVACUATE', priority: 'EMERGENCY_ACTION' as const, actionItem: '', rationale: '' },
      { id: '', code: 'REC_TACHY_REST', priority: 'ACTION_REQUIRED' as const, actionItem: '', rationale: '' }
    ];

    const ranked = rankRecommendations(unranked, mockConfig);
    expect(ranked[0].code).toBe('REC_GAS_EVACUATE');
    expect(ranked[1].code).toBe('REC_TACHY_REST');
    expect(ranked[2].code).toBe('REC_BRADY_WARMUP');
  });

  test('Conflict Resolution Matrix: Evacuation protocol overrides fallback immobilizations', () => {
    const conflictList = [
      { id: '', code: 'REC_GAS_EVACUATE', priority: 'EMERGENCY_ACTION' as const, actionItem: 'EVACUATE', rationale: '' },
      { id: '', code: 'REC_FALL_EMERGENCY', priority: 'EMERGENCY_ACTION' as const, actionItem: 'STAY STILL', rationale: '' }
    ];

    const resolved = resolveRecommendationConflicts(conflictList, mockConfig);
    const codes = resolved.map(r => r.code);
    
    expect(codes).toContain('REC_GAS_EVACUATE');
    expect(codes).not.toContain('REC_FALL_EMERGENCY');
  });

  test('Pipeline & Cooldown Integration: Throttles re-issuance inside cooldown windows', () => {
    const baseTime = 1710000000000;
    const telemetry = { heartRate: 120, spo2: 95, gas: 100 };
    const activity = { currentActivity: 'SITTING', confidence: 0.95 };
    const trends = { heartRate: { direction: 'RISING' }, spo2: { direction: 'STABLE' } };
    const riskStatus = { overallSeverity: 'MEDIUM', isTransientSpike: false };
    const alert = null;

    // Frame 1: First processing loop triggers the baseline rest recommendation
    const out1 = engine.generateRecommendations(telemetry, activity, trends, riskStatus, alert, baseTime);
    expect(out1.recommendations.length).toBe(1);
    expect(out1.primaryActionCode).toBe('REC_TACHY_REST');

    // Frame 2 (2000ms later): Throttled due to ongoing cooldown window
    const out2 = engine.generateRecommendations(telemetry, activity, trends, riskStatus, alert, baseTime + 2000);
    expect(out2.recommendations.length).toBe(0);
    expect(out2.primaryActionCode).toBe('REC_NONE');

    // Frame 3 (6000ms later): Cooldown elapsed (5000ms threshold reached), item safely regenerates
    const out3 = engine.generateRecommendations(telemetry, activity, trends, riskStatus, alert, baseTime + 6000);
    expect(out3.recommendations.length).toBe(1);
    expect(out3.primaryActionCode).toBe('REC_TACHY_REST');
  });
});