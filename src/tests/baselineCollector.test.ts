import { BaselineCollector } from '../services/baseline/baselineCollector';
import { TelemetryReadingInput } from '../types/sqi';

describe('PR5.3 — Baseline Collection Engine', () => {
  const now = 1700000000000;

  beforeEach(() => {
    localStorage.clear();
    BaselineCollector.clearBuffer();
  });

  test('ingests valid readings and rejects invalid ones', () => {
    const validReading: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: 72,
      spO2: 98,
    };

    const invalidReading: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: 15,
      spO2: 98,
    };

    const acceptedValid = BaselineCollector.ingestReading(validReading, null, now);
    const acceptedInvalid = BaselineCollector.ingestReading(invalidReading, null, now);

    expect(acceptedValid).toBe(true);
    expect(acceptedInvalid).toBe(false);
    expect(BaselineCollector.getBuffer()).toHaveLength(1);
  });

  test('calculates accurate empirical mean, stdDev, and confidence score', () => {
    for (let i = 0; i < 12; i++) {
      BaselineCollector.ingestReading(
        {
          timestampMs: now - (12 - i) * 1000,
          heartRate: 70 + (i % 3),
          spO2: 98,
        },
        null,
        now
      );
    }

    const res = BaselineCollector.calculateEmpiricalBaseline(now);
    expect(res.sampleCount).toBe(12);
    expect(res.empiricalRHR).toBe(71);
    expect(res.empiricalSpO2).toBe(98);
    expect(res.isCalibrated).toBe(true);
    expect(res.confidenceScore).toBeGreaterThanOrEqual(20);
  });
});
