import { IRawTelemetry, SpO2State } from '../types/health';
import { IEngineConfig } from '../config/engineConfig';

/**
 * Pure deterministic rule engine evaluating Blood Oxygen Saturation (SpO2) states.
 * Safely guards against uninitialized/disconnected sensor dropouts (value 0).
 */
export const evaluateSpO2Rules = (
  windowData: IRawTelemetry[],
  config: IEngineConfig
): SpO2State => {
  if (!windowData || windowData.length === 0) {
    return 'NORMAL';
  }

  const latestFrame = windowData[windowData.length - 1];
  const currentSpO2 = latestFrame.spo2;
  const limits = config.thresholds.spo2;

  // Intercept detached or uninitialized sensor errors to protect against false positives
  if (currentSpO2 === 0) {
    return 'NORMAL';
  }

  if (currentSpO2 <= limits.critical) {
    return 'CRITICAL_LOW';
  }
  if (currentSpO2 <= limits.low) {
    return 'LOW';
  }

  return 'NORMAL';
};