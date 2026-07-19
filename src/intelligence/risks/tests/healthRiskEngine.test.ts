import { HealthRiskEngine } from '../engine/healthRiskEngine';
import { evaluateHeartRisk, evaluateSpO2Risk, evaluateGasRisk } from '../engine/singleRiskRules';
import { calculateOverallSeverity } from '../engine/riskSeverity';
import { IRiskConfig } from '../config/riskConfig';
import { ISingleRiskAssessment } from '../types/risks';

describe('PR4.4 Health Risk Detection Engine - Automated Test Suite', () => {
  let engine: HealthRiskEngine;

  const mockConfig: IRiskConfig = {
    thresholds: {
      heartRate: {
        bradycardiaMin: 50,
        tachycardiaMax: 100,
        criticalTachycardiaMax: 140,
      },
      spo2: {
        hypoxiaWarningMax: 94,
        hypoxiaCriticalMax: 88,
      },
      gas: {
        hazardousMin: 400,
        lethalMin: 800,
      }
    },
    persistenceWindowsMs: {
      NONE: 0,
      LOW: 2000,
      MEDIUM: 2000,
      HIGH: 2000,
      CRITICAL: 1000,
    }
  };

  beforeEach(() => {
    engine = new HealthRiskEngine(mockConfig);
  });

  test('Single Sensor Risk Rules: Correctly flags distinct boundary anomalies', () => {
    const hrHigh = evaluateHeartRisk(145, mockConfig);
    const o2Low = evaluateSpO2Risk(85, mockConfig);
    const gasHigh = evaluateGasRisk(900, mockConfig);

    expect(hrHigh.severity).toBe('CRITICAL');
    expect(hrHigh.sourceRules).toContain('CRITICAL_TACHYCARDIA_THRESHOLD_EXCEEDED');

    expect(o2Low.severity).toBe('CRITICAL');
    expect(o2Low.sourceRules).toContain('CRITICAL_HYPOXIA_BREACH');

    expect(gasHigh.severity).toBe('CRITICAL');
    expect(gasHigh.sourceRules).toContain('LETHAL_GAS_CONCENTRATION_DETECTED');
  });

  test('Risk Severity Prioritization: Resolves matrix arrays into maximum structural severity', () => {
    const mixedRisks: ISingleRiskAssessment[] = [
      { category: 'CARDIOVASCULAR', severity: 'MEDIUM', sourceRules: [], calculatedValue: 45 },
      { category: 'RESPIRATORY', severity: 'HIGH', sourceRules: [], calculatedValue: 92 },
      { category: 'ENVIRONMENTAL', severity: 'LOW', sourceRules: [], calculatedValue: 410 }
    ];

    const overall = calculateOverallSeverity(mixedRisks);
    expect(overall).toBe('HIGH');
  });

  test('Multi-Sensor Fusion & Transient Filtering: Assesses anomalies across persistence windows', () => {
    const baseTime = 1710000000000;
    
    const telemetry = { heartRate: 145, spo2: 98, gas: 100 }; // Critical Tachycardia
    const activity = { currentActivity: 'SITTING', confidence: 0.95 };
    const trends = {
      heartRate: { direction: 'RISING', deltaValue: 10 },
      spo2: { direction: 'STABLE', deltaValue: 0 }
    };

    // First frame observation: Should be flagged as transient due to persistence rule mapping
    const evaluation1 = engine.evaluateHealthRisks(telemetry, activity, trends, baseTime);
    expect(evaluation1.overallSeverity).toBe('CRITICAL');
    expect(evaluation1.isTransientSpike).toBe(true);

    // Second frame validation within window (500ms later): Still transient
    const evaluation2 = engine.evaluateHealthRisks(telemetry, activity, trends, baseTime + 500);
    expect(evaluation2.isTransientSpike).toBe(true);

    // Third frame validation past configuration cutoff (1500ms total elapsed): Validated breach
    const evaluation3 = engine.evaluateHealthRisks(telemetry, activity, trends, baseTime + 1500);
    expect(evaluation3.isTransientSpike).toBe(false);
  });
});\n