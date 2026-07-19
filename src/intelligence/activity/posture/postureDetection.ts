import { IMotionFeatures, IPostureFeatures } from '../types/activity';
import { IActivityConfig } from '../config/activityConfig';

/**
 * Pure deterministic calculation to infer posture when explicit accelerometer vectors are absent.
 * Leverages stepping dynamics and biometric baseline thresholds to categorize physical orientation states.
 */
export const detectPosture = (
  motionFeatures: IMotionFeatures,
  config: IActivityConfig
): IPostureFeatures => {
  // If the user is actively registering step updates, they must be standing/upright
  if (motionFeatures.isStepIncrementing || motionFeatures.stepVelocity > 0) {
    return { inferredPosture: 'STANDING' };
  }

  // Under relaxed resting parameters (low metabolic activity), infer restful rest states
  if (motionFeatures.heartRateValue > 0 && motionFeatures.heartRateValue <= config.thresholds.noMovementHeartRateMax) {
    return { inferredPosture: 'LYING' };
  }

  // Active metabolic range without stepping dynamics correlates highly to standard workspace contexts
  if (motionFeatures.heartRateValue > config.thresholds.noMovementHeartRateMax) {
    return { inferredPosture: 'SITTING' };
  }

  return { inferredPosture: 'UNKNOWN' };
};\n