/**
 * NOEXCUSE HPO V2 - Baseline Engine Unit Tests
 */

import { BaselineEngine } from '../services/baseline/baselineEngine';
import { ValidatedTelemetryPacket } from '../services/sqi/sqiFilter';

describe('BaselineEngine', () => {
  let engine: BaselineEngine;

  beforeEach(() => {
    engine = new BaselineEngine({
      minSamplesForModerateConfidence: 5,
      minSamplesForHighConfidence: 10,
      minSamplesForEstablishedConfidence: 20,
    });
  });

  it('initializes an empty baseline state correctly', () => {
    const state = engine.createEmptyState('user_1');
    expect(state.userId).toBe('user_1');
    expect(state.confidence).toBe('LOW');
    expect(state.restingHeartRate.sampleCount).toBe(0);
  });

  it('accumulates valid SQI packets and updates mean and confidence', () => {
    const state = engine.createEmptyState('user_1');
    const validPackets: ValidatedTelemetryPacket[] = Array.from({ length: 6 }, (_, i) => ({
      raw: { timestamp: Date.now() + i * 1000, heartRate: 70 + i, spo2: 98, gasLevel: 100 },
      sqi: {
        timestamp: Date.now(),
        overallScore: 0.95,
        grade: 'EXCELLENT',
        isUsableForBaselines: true,
        heartRateQuality: { value: 70 + i, isValid: true, score: 1, flags: ['VALID'] },
        spo2Quality: { value: 98, isValid: true, score: 1, flags: ['VALID'] },
        gasQuality: { value: 100, isValid: true, score: 1, flags: ['VALID'] },
        motionQuality: { value: 0, isValid: true, score: 1, flags: ['VALID'] },
        summaryReason: 'Valid',
      },
    }));

    const updated = engine.accumulateBatch(state, validPackets);
    expect(updated.restingHeartRate.sampleCount).toBe(6);
    expect(updated.restingHeartRate.mean).toBe(72.5); // Mean of 70, 71, 72, 73, 74, 75
    expect(updated.confidence).toBe('MODERATE');
  });

  it('ignores packets where SQI isUsableForBaselines is false', () => {
    const state = engine.createEmptyState('user_1');
    const invalidPacket: ValidatedTelemetryPacket = {
      raw: { timestamp: Date.now(), heartRate: 220, spo2: 98 },
      sqi: {
        timestamp: Date.now(),
        overallScore: 0.2,
        grade: 'INVALID',
        isUsableForBaselines: false,
        heartRateQuality: { value: 220, isValid: false, score: 0, flags: ['IMPOSSIBLE_VALUE'] },
        spo2Quality: { value: 98, isValid: true, score: 1, flags: ['VALID'] },
        gasQuality: { value: 100, isValid: true, score: 1, flags: ['VALID'] },
        motionQuality: { value: 0, isValid: true, score: 1, flags: ['VALID'] },
        summaryReason: 'Invalid HR',
      },
    };

    const updated = engine.accumulateBatch(state, [invalidPacket]);
    expect(updated.restingHeartRate.sampleCount).toBe(0);
    expect(updated.confidence).toBe('LOW');
  });
});
