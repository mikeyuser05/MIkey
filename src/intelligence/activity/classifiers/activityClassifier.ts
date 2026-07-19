import { UserActivity, IMotionFeatures, IPostureFeatures } from '../types/activity';
import { IActivityConfig } from '../config/activityConfig';

/**
 * Pure deterministic processing node that aggregates calculated motion metrics 
 * and posture heuristics into a singular distinct base user activity state.
 */
export const classifyRawActivity = (
  motion: IMotionFeatures,
  posture: IPostureFeatures,
  config: IActivityConfig
): UserActivity => {
  
  // 1. High Velocity Movement Processing
  if (motion.stepVelocity >= config.thresholds.runningVelocityMin || 
     (motion.isStepIncrementing && motion.heartRateValue >= config.thresholds.runningHeartRateMin)) {
    return 'RUNNING';
  }

  // 2. Standard Velocity Walking Processing
  if (motion.stepVelocity >= config.thresholds.walkingVelocityMin) {
    return 'WALKING';
  }

  // 3. Static States Processing based on Inferred Posture Heuristics
  switch (posture.inferredPosture) {
    case 'STANDING':
      return 'STANDING';
    case 'SITTING':
      return 'SITTING';
    case 'LYING':
      return 'NO_MOVEMENT'; // Zero movement resting condition
    case 'UNKNOWN':
    default:
      return 'UNKNOWN';
  }
};