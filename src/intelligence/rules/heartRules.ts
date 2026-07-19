import { IRawTelemetry, HeartState } from '../types/health';
import { IEngineConfig } from '../config/engineConfig';

/**
 * Pure deterministic rule engine evaluating Heart Rate states.
 * Inspects the current frame within the configured temporal sliding window boundary.
 */
export const evaluateHeartRules = (
  windowData: IRawTelemetry[],
  config: IEngineConfig
): HeartState => {
  if (!windowData || windowData.length === 0) {
    return 'NORMAL';
  }

  // Evaluate structural state based on the latest available metric packet
  const latestFrame = windowData[windowData.length - 1];
  const currentHR = latestFrame.heartRate;
  const limits = config.thresholds.heart;

  if (currentHR >= limits.criticalHigh) {
    return 'CRITICAL_HIGH';
  }
  if (currentHR >= limits.high) {
    return 'ELEVATED';
  }
  if (currentHR <= limits.low && currentHR > 0) {
    return 'LOW';
  }

  return 'NORMAL';
};