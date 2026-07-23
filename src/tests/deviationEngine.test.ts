/**
 * NOEXCUSE HPO V2 - Deviation Engine Unit Tests
 */

import { DeviationEngine } from '../services/deviation/deviationEngine';
import { PersonalNormalRanges } from '../types/normalRange';
import { ValidatedTelemetryPacket } from '../services/sqi/sqiFilter';

describe('DeviationEngine', () => {
  let engine: DeviationEngine;

  beforeEach(() => {
    engine = new DeviationEngine();
  });

  const mockRanges: PersonalNormalRanges = {
    userId: 'user_1',
    calculatedAt: Date.now(),
    confidence: 'HIGH',
    heartRateRange: { lowerBound: 60, upperBound: 80, targetMean: 70, toleranceMargin: 10, isStatedProfileFallback: false },
    spo2Range: { lowerBound: 95, upperBound: 100, targetMean: 98, toleranceMargin: 5, isStatedProfileFallback: false },
    gasRange: { lowerBound: 0, upperBound: 300, targetMean: 100, toleranceMargin: 200, isStatedProfileFallback: false },
  };

  it('evaluates normal telemetry correctly without flagging deviations', () => {
    const packet: ValidatedTelemetryPacket = {
      raw: { timestamp: Date.now(), heartRate: 72, spo2: 98, gasLevel: 120 },
      sqi: {
        timestamp: Date.now(),
        overallScore: 0.95,
        grade: 'EXCELLENT',
        isUsableForBaselines: true,
        heartRateQuality: { value: 72, isValid: true, score: 1, flags: ['VALID'] },
        spo2Quality: { value: 98, isValid: true, score: 1, flags: ['VALID'] },
        gasQuality: { value: 120, isValid: true, score: 1, flags: ['VALID'] },
        motionQuality: { value: 0, isValid: true, score: 1, flags: ['VALID'] },
        summaryReason: 'Valid',
      },
    };

    const dev = engine.evaluateDeviation(packet, mockRanges);
    expect(dev.hasAnyDeviation).toBe(false);
    expect(dev.maxSeverity).toBe('NORMAL');
    expect(dev.heartRateDeviation.severity).toBe('NORMAL');
  });

  it('flags elevated heart rate deviation accurately', () => {
    const packet: ValidatedTelemetryPacket = {
      raw: { timestamp: Date.now(), heartRate: 105 /* Upper bound is 80, margin is 10 */, spo2: 98, gasLevel: 100 },
      sqi: {
        timestamp: Date.now(),
        overallScore: 0.95,
        grade: 'EXCELLENT',
        isUsableForBaselines: true,
        heartRateQuality: { value: 105, isValid: true, score: 1, flags: ['VALID'] },
        spo2Quality: { value: 98, isValid: true, score: 1, flags: ['VALID'] },
        gasQuality: { value: 100, isValid: true, score: 1, flags: ['VALID'] },
        motionQuality: { value: 0, isValid: true, score: 1, flags: ['VALID'] },
        summaryReason: 'Valid',
      },
    };

    const dev = engine.evaluateDeviation(packet, mockRanges);
    expect(dev.hasAnyDeviation).toBe(true);
    expect(dev.heartRateDeviation.isAboveNormal).toBe(true);
    expect(dev.heartRateDeviation.severity).toBe('CRITICAL_DEVIATION');
  });
});
