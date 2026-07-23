/**
 * NOEXCUSE HPO V2 - Normal Range Engine Unit Tests
 */

import { NormalRangeEngine } from '../services/range/normalRangeEngine';
import { DEFAULT_HEALTH_PROFILE } from '../services/profile/profileValidator';
import { PersonalBaselineState } from '../types/baseline';

describe('NormalRangeEngine', () => {
  let engine: NormalRangeEngine;

  beforeEach(() => {
    engine = new NormalRangeEngine();
  });

  const mockBaseline = (samples: number, hrMean: number, hrStd: number): PersonalBaselineState => ({
    userId: 'user_1',
    updatedAt: Date.now(),
    confidence: samples >= 100 ? 'HIGH' : samples >= 30 ? 'MODERATE' : 'LOW',
    overallConfidenceScore: samples >= 100 ? 0.85 : 0.3,
    restingHeartRate: { sampleCount: samples, mean: hrMean, stdDev: hrStd, median: hrMean, minObserved: 50, maxObserved: 100, lastUpdated: Date.now() },
    baselineSpo2: { sampleCount: samples, mean: 98, stdDev: 1, median: 98, minObserved: 95, maxObserved: 100, lastUpdated: Date.now() },
    baselineGasLevel: { sampleCount: samples, mean: 120, stdDev: 15, median: 120, minObserved: 80, maxObserved: 200, lastUpdated: Date.now() },
    windowStartTimestamp: Date.now() - 10000,
    windowEndTimestamp: Date.now(),
  });

  it('falls back to stated profile when baseline sample count is low', () => {
    const baseline = mockBaseline(10, 72, 3);
    const ranges = engine.computeRanges(DEFAULT_HEALTH_PROFILE, baseline);

    expect(ranges.heartRateRange.isStatedProfileFallback).toBe(true);
    expect(ranges.heartRateRange.lowerBound).toBe(DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMin);
    expect(ranges.heartRateRange.upperBound).toBe(DEFAULT_HEALTH_PROFILE.statedBaselines.expectedRestingHrMax);
  });

  it('computes dynamic bounds using statistical baseline when enough samples exist', () => {
    const baseline = mockBaseline(150, 68, 4);
    const ranges = engine.computeRanges(DEFAULT_HEALTH_PROFILE, baseline);

    expect(ranges.heartRateRange.isStatedProfileFallback).toBe(false);
    expect(ranges.heartRateRange.targetMean).toBe(68);
    expect(ranges.heartRateRange.lowerBound).toBe(60); // 68 - (4 * 2)
    expect(ranges.heartRateRange.upperBound).toBe(76); // 68 + (4 * 2)
  });
});
