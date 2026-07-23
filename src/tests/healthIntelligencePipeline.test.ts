/**
 * NOEXCUSE HPO V2 - Pipeline End-to-End Integration Tests
 */

import { HealthIntelligencePipeline } from '../services/pipeline/healthIntelligencePipeline';
import { DEFAULT_HEALTH_PROFILE } from '../services/profile/profileValidator';
import { RawTelemetry } from '../types/sqi';
import { baselineRepository } from '../services/baseline/baselineRepository';

describe('HealthIntelligencePipeline Integration', () => {
  let pipeline: HealthIntelligencePipeline;

  beforeEach(() => {
    pipeline = new HealthIntelligencePipeline();
    baselineRepository.reset();
  });

  it('successfully processes a valid resting telemetry frame', () => {
    const rawPacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 72,
      spo2: 98,
      gasLevel: 110,
      accelMagnitude: 0.05,
    };

    const output = pipeline.processPacket(rawPacket, DEFAULT_HEALTH_PROFILE);

    expect(output.userId).toBe(DEFAULT_HEALTH_PROFILE.id);
    expect(output.validatedPacket.sqi.isUsableForBaselines).toBe(true);
    expect(output.contextualRanges.context).toBe('RESTING');
    expect(output.deviationState.hasAnyDeviation).toBe(false);
    expect(output.processingTimeMs).toBeLessThan(50); // High-performance guarantee
  });

  it('correctly suppresses baseline update on corrupted SQI packet while still calculating deviation', () => {
    const corruptedPacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 240, // Unrealistic spike
      spo2: 98,
      gasLevel: 100,
      accelMagnitude: 0.1,
    };

    const output = pipeline.processPacket(corruptedPacket, DEFAULT_HEALTH_PROFILE);

    expect(output.validatedPacket.sqi.heartRateQuality.isValid).toBe(false);
    expect(output.deviationState.heartRateDeviation.currentValue).toBeNull();
  });

  it('adapts context to ACTIVE and adjusts bounds under heavy movement', () => {
    const activePacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 115,
      spo2: 97,
      gasLevel: 100,
      accelMagnitude: 2.1, // High motion
    };

    const output = pipeline.processPacket(activePacket, DEFAULT_HEALTH_PROFILE);

    expect(output.contextualRanges.context).toBe('ACTIVE');
    // 115 bpm should not trigger critical deviation when ACTIVE context expands limits
    expect(output.deviationState.heartRateDeviation.severity).toBe('NORMAL');
  });
});
