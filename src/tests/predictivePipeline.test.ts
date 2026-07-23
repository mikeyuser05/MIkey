/**
 * NOEXCUSE HPO V2 - Predictive Pipeline Integration Tests
 */

import { PredictivePipeline } from '../services/pipeline/predictivePipeline';
import { UserPersonalBaseline } from '../types/baseline';
import { ContextualFactors } from '../types/contextualBaseline';
import { TelemetryPacket } from '../types/telemetry';

describe('PredictivePipeline Integration', () => {
  let pipeline: PredictivePipeline;

  beforeEach(() => {
    pipeline = new PredictivePipeline();
  });

  const mockBaseline: UserPersonalBaseline = {
    userId: 'user_1',
    hrBaseline: { mean: 70, stdDev: 5, min: 60, max: 80, sampleCount: 1000, lastUpdated: Date.now() },
    spo2Baseline: { mean: 98, stdDev: 1, min: 95, max: 100, sampleCount: 1000, lastUpdated: Date.now() },
    gasBaseline: { mean: 100, stdDev: 20, min: 0, max: 300, sampleCount: 1000, lastUpdated: Date.now() },
  };

  const mockContext: ContextualFactors = {
    activityType: 'RESTING',
    ambientTemperatureC: 22,
    altitudeMeters: 100,
  };

  it('runs an end-to-end frame processing pass cleanly', () => {
    const rawTelemetry: TelemetryPacket = {
      timestamp: Date.now(),
      heartRate: 72,
      spo2: 98,
      gasLevel: 100,
    };

    const output = pipeline.processTelemetry('user_1', rawTelemetry, mockBaseline, mockContext);

    expect(output.userId).toBe('user_1');
    expect(output.sqiPacket.sqi.grade).toBe('EXCELLENT');
    expect(output.riskScore.riskLevel).toBe('LOW');
    expect(output.trendResult.heartRateTrend.trajectory).toBe('STABLE');
    expect(output.earlyWarning.alertLevel).toBe('NONE');
  });

  it('flags an integrated early warning on sudden SpO2 drops across the full pipeline', () => {
    const t0 = Date.now();

    // Frame 1: Normal
    pipeline.processTelemetry(
      'user_1',
      { timestamp: t0, heartRate: 70, spo2: 98, gasLevel: 100 },
      mockBaseline,
      mockContext
    );

    // Frame 2 (30s later): Rapid SpO2 drop to 94%
    const output2 = pipeline.processTelemetry(
      'user_1',
      { timestamp: t0 + 30000, heartRate: 75, spo2: 94, gasLevel: 100 },
      mockBaseline,
      mockContext
    );

    expect(output2.deviationState.hasAnyDeviation).toBe(true);
    expect(output2.trendResult.spo2Trend.trajectory).toBe('DROPPING_FAST');
    expect(output2.earlyWarning.alertLevel).toMatch(/WARNING|CRITICAL_PREDICTED/);
  });
});
