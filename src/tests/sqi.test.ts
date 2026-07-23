import { SQIEngine } from '../services/sqi/sqiEngine';
import { TelemetryReadingInput } from '../types/sqi';

describe('PR5.2 — Data Quality / SQI Contract', () => {
  const now = 1700000000000;

  test('valid telemetry receives EXCELLENT grade and is valid for baseline', () => {
    const input: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: 72,
      spO2: 98,
    };

    const res = SQIEngine.evaluate(input, null, now);
    expect(res.grade).toBe('EXCELLENT');
    expect(res.score).toBe(100);
    expect(res.isValidForBaseline).toBe(true);
    expect(res.flags).toHaveLength(0);
  });

  test('missing heartRate flags MISSING_DATA and marks INVALID', () => {
    const input: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: null,
      spO2: 98,
    };

    const res = SQIEngine.evaluate(input, null, now);
    expect(res.grade).toBe('INVALID');
    expect(res.isValidForBaseline).toBe(false);
    expect(res.flags).toContain('MISSING_DATA');
  });

  test('impossible heartRate flags out-of-range and invalidates baseline use', () => {
    const input: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: 10,
      spO2: 98,
    };

    const res = SQIEngine.evaluate(input, null, now);
    expect(res.flags).toContain('HR_OUT_OF_PHYSIOLOGICAL_RANGE');
    expect(res.isValidForBaseline).toBe(false);
  });

  test('sudden implausible HR jump flags IMPLAUSIBLE_HR_SPIKE', () => {
    const prev: TelemetryReadingInput = {
      timestampMs: now - 2000,
      heartRate: 70,
      spO2: 98,
    };
    const curr: TelemetryReadingInput = {
      timestampMs: now - 1000,
      heartRate: 150,
      spO2: 98,
    };

    const res = SQIEngine.evaluate(curr, prev, now);
    expect(res.flags).toContain('IMPLAUSIBLE_HR_SPIKE');
    expect(res.score).toBeLessThan(90);
  });
});
