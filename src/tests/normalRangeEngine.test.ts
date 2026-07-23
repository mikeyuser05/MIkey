import { NormalRangeEngine } from '../services/baseline/normalRangeEngine';
import { createDefaultProfile } from '../services/healthProfile/healthProfileDefaults';
import { EmpiricBaselineResult } from '../types/baselineEngine';

describe('PR5.4 — Individual Normal Range Engine', () => {
  const profile = createDefaultProfile('test-user'); // age 30, maxHR 187, default RHR 70

  test('calculates default demographic normal ranges when uncalibrated', () => {
    const ranges = NormalRangeEngine.calculateRanges(profile, null);
    expect(ranges.isEmpiricallyDerived).toBe(false);
    expect(ranges.heartRateResting.target).toBe(70);
    expect(ranges.heartRateResting.lower).toBe(60); // 70 - 10
    expect(ranges.heartRateResting.upper).toBe(80); // 70 + 10
    expect(ranges.spO2Resting.lower).toBe(95); // 98 - 3
  });

  test('calculates empirical dynamic normal ranges when calibrated', () => {
    const empirical: EmpiricBaselineResult = {
      empiricalRHR: 64,
      empiricalSpO2: 97,
      hrStdDev: 4.0, // hrMargin = 1.5 * 4 = 6
      spO2StdDev: 1.0, // spO2Margin = 2
      sampleCount: 50,
      confidenceScore: 90,
      isCalibrated: true,
      lastUpdatedIso: new Date().toISOString(),
    };

    const ranges = NormalRangeEngine.calculateRanges(profile, empirical);
    expect(ranges.isEmpiricallyDerived).toBe(true);
    expect(ranges.heartRateResting.target).toBe(64);
    expect(ranges.heartRateResting.lower).toBe(58); // 64 - 6
    expect(ranges.heartRateResting.upper).toBe(70); // 64 + 6
    expect(ranges.spO2Resting.lower).toBe(95); // 97 - 2
  });

  test('respects custom profile overrides if provided', () => {
    const customProfile = {
      ...profile,
      baselines: {
        ...profile.baselines,
        customHRLowerBound: 52,
        customHRUpperBound: 88,
      },
    };

    const ranges = NormalRangeEngine.calculateRanges(customProfile, null);
    expect(ranges.heartRateResting.lower).toBe(52);
    expect(ranges.heartRateResting.upper).toBe(88);
  });
});
