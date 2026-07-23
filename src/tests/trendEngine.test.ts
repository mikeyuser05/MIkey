/**
 * NOEXCUSE HPO V2 - Trend Engine Unit Tests
 */

import { TrendEngine } from '../services/trend/trendEngine';
import { ValidatedTelemetryPacket } from '../services/sqi/sqiFilter';

describe('TrendEngine', () => {
  let engine: TrendEngine;

  beforeEach(() => {
    engine = new TrendEngine();
    engine.resetUserBuffer('user_1');
  });

  const createPacket = (timestamp: number, hr: number, spo2: number, gas: number): ValidatedTelemetryPacket => ({
    raw: { timestamp, heartRate: hr, spo2, gasLevel: gas },
    sqi: {
      timestamp,
      overallScore: 0.95,
      grade: 'EXCELLENT',
      isUsableForBaselines: true,
      heartRateQuality: { value: hr, isValid: true, score: 1, flags: ['VALID'] },
      spo2Quality: { value: spo2, isValid: true, score: 1, flags: ['VALID'] },
      gasQuality: { value: gas, isValid: true, score: 1, flags: ['VALID'] },
      motionQuality: { value: 0, isValid: true, score: 1, flags: ['VALID'] },
      summaryReason: 'Valid',
    },
  });

  it('detects STABLE trajectory under consistent reading values', () => {
    const t0 = Date.now();
    engine.analyzeTrend('user_1', createPacket(t0, 70, 98, 100));
    const result = engine.analyzeTrend('user_1', createPacket(t0 + 30000, 71, 98, 102));

    expect(result.heartRateTrend.trajectory).toBe('STABLE');
    expect(result.spo2Trend.trajectory).toBe('STABLE');
    expect(result.hasRapidKinematicExcursion).toBe(false);
  });

  it('detects RISING_FAST trajectory and rapid excursion on rapid heart rate spike', () => {
    const t0 = Date.now();
    engine.analyzeTrend('user_1', createPacket(t0, 70, 98, 100));
    // Heart rate jumps by 40 bpm over 30 seconds (+80 bpm/min velocity)
    const result = engine.analyzeTrend('user_1', createPacket(t0 + 30000, 110, 98, 100));

    expect(result.heartRateTrend.trajectory).toBe('RISING_FAST');
    expect(result.heartRateTrend.isRapidExcursion).toBe(true);
    expect(result.hasRapidKinematicExcursion).toBe(true);
  });

  it('detects DROPPING_FAST trajectory on rapid SpO2 drop', () => {
    const t0 = Date.now();
    engine.analyzeTrend('user_1', createPacket(t0, 70, 99, 100));
    // SpO2 drops by 5% over 30 seconds (-10%/min velocity)
    const result = engine.analyzeTrend('user_1', createPacket(t0 + 30000, 70, 94, 100));

    expect(result.spo2Trend.trajectory).toBe('DROPPING_FAST');
    expect(result.spo2Trend.isRapidExcursion).toBe(true);
  });
});
