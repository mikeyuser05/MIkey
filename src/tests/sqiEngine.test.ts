/**
 * NOEXCUSE HPO V2 - SQI Engine Unit Tests
 */

import { SQIEngine } from '../services/sqi/sqiEngine';

describe('SQIEngine', () => {
  let sqiEngine: SQIEngine;

  beforeEach(() => {
    sqiEngine = new SQIEngine({
      hrMin: 30,
      hrMax: 200,
      hrMaxDeltaPerSec: 15,
      spo2Min: 80,
      spo2Max: 100,
      maxStaleAgeMs: 5000,
    });
  });

  it('marks valid telemetry as usable for baselines', () => {
    const now = Date.now();
    const sample = { timestamp: now, heartRate: 72, spo2: 98, gasLevel: 120, stepCount: 100 };
    
    const result = sqiEngine.evaluateSample(sample, null, now);
    expect(result.isUsableForBaselines).toBe(true);
    expect(result.grade).toBe('EXCELLENT');
    expect(result.heartRateQuality.isValid).toBe(true);
  });

  it('flags impossible values as invalid', () => {
    const now = Date.now();
    const sample = { timestamp: now, heartRate: 250 /* Above hrMax 200 */, spo2: 98 };

    const result = sqiEngine.evaluateSample(sample, null, now);
    expect(result.isUsableForBaselines).toBe(false);
    expect(result.heartRateQuality.flags).toContain('IMPOSSIBLE_VALUE');
  });

  it('detects physically implausible rate-of-change spikes', () => {
    const now = Date.now();
    const prev = { timestamp: now - 1000, heartRate: 70, spo2: 98 };
    const current = { timestamp: now, heartRate: 130 /* Jump of 60 bpm in 1 sec */, spo2: 98 };

    const result = sqiEngine.evaluateSample(current, prev, now);
    expect(result.isUsableForBaselines).toBe(false);
    expect(result.heartRateQuality.flags).toContain('PHYSICAL_SPIKE');
  });

  it('flags stale data beyond max allowable packet age', () => {
    const now = Date.now();
    const staleSample = { timestamp: now - 10000 /* 10s old vs 5s limit */, heartRate: 72, spo2: 98 };

    const result = sqiEngine.evaluateSample(staleSample, null, now);
    expect(result.heartRateQuality.flags).toContain('STALE_DATA');
  });
});
