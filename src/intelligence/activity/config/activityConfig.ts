import { UserActivity } from '../types/activity';

export interface IActivityConfig {
  windowSizeMs: number;
  stabilization: {
    debounceDelayMs: number;
    minHoldDurationMs: Record<UserActivity, number>;
  };
  thresholds: {
    walkingVelocityMin: number; // steps/sec
    runningVelocityMin: number; // steps/sec
    noMovementHeartRateMax: number;
    runningHeartRateMin: number;
  };
}

export const DEFAULT_ACTIVITY_CONFIG: IActivityConfig = {
  windowSizeMs: 15000, // 15s evaluation frame
  stabilization: {
    debounceDelayMs: 2000,
    minHoldDurationMs: {
      UNKNOWN: 1000,
      STANDING: 3000,
      SITTING: 3000,
      LYING: 5000,
      WALKING: 2000,
      RUNNING: 2000,
      FALL: 1000,
      NO_MOVEMENT: 4000,
    },
  },
  thresholds: {
    walkingVelocityMin: 0.5,  // > 0.5 steps per second
    runningVelocityMin: 2.2,  // > 2.2 steps per second
    noMovementHeartRateMax: 65,
    runningHeartRateMin: 100,
  },
};\n