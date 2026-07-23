/**
 * NOEXCUSE HPO V2 - Health Risk Engine Unit Tests
 */

import { HealthRiskEngine } from '../services/risk/riskEngine';
import { PersonalDeviationState } from '../types/deviation';

describe('HealthRiskEngine', () => {
  let engine: HealthRiskEngine;

  beforeEach(() => {
    engine = new HealthRiskEngine();
  });

  const mockDeviationState = (
    hrSev: any = 'NORMAL',
    spo2Sev: any = 'NORMAL',
    gasSev: any = 'NORMAL'
  ): PersonalDeviationState => ({
    timestamp: Date.now(),
    userId: 'user_1',
    hasAnyDeviation: hrSev !== 'NORMAL' || spo2Sev !== 'NORMAL' || gasSev !== 'NORMAL',
    maxSeverity: hrSev,
    heartRateDeviation: {
      currentValue: 75,
      baselineMean: 70,
      lowerBound: 60,
      upperBound: 80,
      deltaFromMean: 5,
      deltaFromBoundary: hrSev !== 'NORMAL' ? 10 : 0,
      severity: hrSev,
      isAboveNormal: hrSev !== 'NORMAL',
      isBelowNormal: false,
      explanation: '',
    },
    spo2Deviation: {
      currentValue: 98,
      baselineMean: 98,
      lowerBound: 95,
      upperBound: 100,
      deltaFromMean: 0,
      deltaFromBoundary: spo2Sev !== 'NORMAL' ? 5 : 0,
      severity: spo2Sev,
      isAboveNormal: false,
      isBelowNormal: spo2Sev !== 'NORMAL',
      explanation: '',
    },
    gasDeviation: {
      currentValue: 100,
      baselineMean: 100,
      lowerBound: 0,
      upperBound: 300,
      deltaFromMean: 0,
      deltaFromBoundary: gasSev !== 'NORMAL' ? 50 : 0,
      severity: gasSev,
      isAboveNormal: gasSev !== 'NORMAL',
      isBelowNormal: false,
      explanation: '',
    },
  });

  it('evaluates normal biometrics to a LOW risk score of 0', () => {
    const devState = mockDeviationState('NORMAL', 'NORMAL', 'NORMAL');
    const result = engine.calculateRiskScore(devState);

    expect(result.overallScore).toBe(0);
    expect(result.riskLevel).toBe('LOW');
    expect(result.dominantRiskFactor).toBe('None');
  });

  it('heavily weights SpO2 critical drops due to clinical severity weight (0.45)', () => {
    const devState = mockDeviationState('NORMAL', 'CRITICAL_DEVIATION', 'NORMAL');
    const result = engine.calculateRiskScore(devState);

    expect(result.overallScore).toBeGreaterThanOrEqual(40);
    expect(result.dominantRiskFactor).toBe('SpO2');
  });

  it('compounds multiple critical deviations into CRITICAL risk level', () => {
    const devState = mockDeviationState('CRITICAL_DEVIATION', 'CRITICAL_DEVIATION', 'CRITICAL_DEVIATION');
    const result = engine.calculateRiskScore(devState);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.riskLevel).toBe('CRITICAL');
  });
});
