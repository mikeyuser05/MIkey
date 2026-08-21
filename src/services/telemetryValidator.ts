import { BaselineVitals } from '../types/pr36Patient';

export interface RawTelemetry {
  heartRate: number;
  spO2: number;
  temperature: number;
  gasPpm: number;
  timestamp: number;
}

export interface ValidatedTelemetry extends RawTelemetry {
  isHRValid: boolean;
  isSpO2Valid: boolean;
  isStale: boolean;
  anomaliesDetected: string[];
}

const STALE_TIMEOUT_MS = 5000; // Data older than 5s is marked stale

export class TelemetryValidator {
  static validate(data: RawTelemetry, baseline?: BaselineVitals): ValidatedTelemetry {
    const now = Date.now();
    const isStale = now - data.timestamp > STALE_TIMEOUT_MS;
    const anomalies: string[] = [];

    // Out of bounds validation
    const isHRValid = data.heartRate >= 30 && data.heartRate <= 220;
    const isSpO2Valid = data.spO2 >= 70 && data.spO2 <= 100;

    if (!isHRValid) anomalies.push('Heart rate out of physiological bounds (30-220 bpm)');
    if (!isSpO2Valid) anomalies.push('SpO2 sensor reading invalid (<70% or >100%)');
    if (isStale) anomalies.push('Telemetry stream is stale (>5s delay)');

    // Relative to baseline anomaly check
    if (baseline && data.heartRate > baseline.restingHeartRate + 50) {
      anomalies.push('HR Spike detected relative to patient baseline');
    }

    return {
      ...data,
      isHRValid,
      isSpO2Valid,
      isStale,
      anomaliesDetected: anomalies,
    };
  }
}
