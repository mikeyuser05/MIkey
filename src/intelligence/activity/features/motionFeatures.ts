import { IRawTelemetry } from '../../types/health';
import { IMotionFeatures } from '../types/activity';

/**
 * Extract motion metrics deterministically based on step counter differentials and timestamp deltas.
 * Operates strictly on pure mathematical transformations across the sliding telemetry buffer.
 */
export const extractMotionFeatures = (
  windowData: IRawTelemetry[]
): IMotionFeatures => {
  if (!windowData || windowData.length < 2) {
    return {
      stepDelta: 0,
      timeDeltaMs: 0,
      stepVelocity: 0,
      heartRateValue: windowData.length > 0 ? windowData[windowData.length - 1].heartRate : 0,
      isStepIncrementing: false
    };
  }

  const initialFrame = windowData[0];
  const latestFrame = windowData[windowData.length - 1];

  const stepDelta = Math.max(0, latestFrame.steps - initialFrame.steps);
  const timeDeltaMs = Math.max(0, latestFrame.timestamp - initialFrame.timestamp);

  // Convert step delta into contextual velocity (steps per second)
  const stepVelocity = timeDeltaMs > 0 ? (stepDelta / (timeDeltaMs / 1000)) : 0;
  const isStepIncrementing = stepDelta > 0;

  return {
    stepDelta,
    timeDeltaMs,
    stepVelocity,
    heartRateValue: latestFrame.heartRate,
    isStepIncrementing
  };
};\n