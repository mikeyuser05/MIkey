import { UserActivity } from '../../activity/types/activity';
import { IActivityAccumulation } from '../types/trends';

/**
 * Pure deterministic calculation node tracking total time intervals 
 * spent within each classified activity state configuration.
 */
export const calculateActivityDurations = (
  history: { timestamp: number; currentActivity: UserActivity }[]
): IActivityAccumulation => {
  const durations: Record<UserActivity, number> = {
    UNKNOWN: 0,
    STANDING: 0,
    SITTING: 0,
    LYING: 0,
    WALKING: 0,
    RUNNING: 0,
    FALL: 0,
    NO_MOVEMENT: 0
  };

  if (!history || history.length < 2) {
    return {
      activityDurationsMs: durations,
      totalTrackedTimeMs: 0
    };
  }

  let totalTrackedTimeMs = 0;

  // Integrate durations across discrete steps in the historical array
  for (let i = 0; i < history.length - 1; i++) {
    const currentFrame = history[i];
    const nextFrame = history[i + 1];
    
    const deltaMs = Math.max(0, nextFrame.timestamp - currentFrame.timestamp);
    
    if (deltaMs > 0 && currentFrame.currentActivity in durations) {
      durations[currentFrame.currentActivity] += deltaMs;
      totalTrackedTimeMs += deltaMs;
    }
  }

  return {
    activityDurationsMs: durations,
    totalTrackedTimeMs
  };
};\n