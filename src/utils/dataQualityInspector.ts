/**
 * NOEXCUSE HPO V2 - Data Quality Inspector
 * Distinguishes true physiological emergencies from sensor drops / stale data.
 */

import { DataQuality, RawTelemetrySnapshot } from '../types/pr11Triage';

const STALE_DATA_THRESHOLD_MS = 10000; // 10s timeout for stale check

export function inspectDataQuality(snapshot: RawTelemetrySnapshot, currentTimeMs: number = Date.now()): DataQuality {
  if (!snapshot) return 'MISSING';
  
  // Check communication/latency freshness
  if (currentTimeMs - snapshot.timestamp > STALE_DATA_THRESHOLD_MS) {
    return 'STALE';
  }

  // Heart Rate Specific Quality Rules (Zero does NOT mean cardiac arrest by default)
  if (snapshot.heartRate !== undefined) {
    if (snapshot.heartRate === 0) return 'SENSOR_ERROR'; // MAX30100 contact lost or I2C issue
    if (snapshot.heartRate < 0 || snapshot.heartRate > 250) return 'INVALID';
  }

  // SpO2 Specific Quality Rules
  if (snapshot.spo2 !== undefined) {
    if (snapshot.spo2 === 0) return 'SENSOR_ERROR';
    if (snapshot.spo2 < 50 || snapshot.spo2 > 100) return 'INVALID';
  }

  // Gas Sensor Specific Quality Rules
  if (snapshot.gasPpm !== undefined) {
    if (snapshot.gasPpm < 0 || snapshot.gasPpm > 10000) return 'INVALID';
  }

  return 'VALID';
}
