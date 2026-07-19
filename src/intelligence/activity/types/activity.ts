/**
 * NOEXCUSE HPO V2: PR4.2 Activity Recognition Domain Types
 */

export type UserActivity =
  | 'UNKNOWN'
  | 'STANDING'
  | 'SITTING'
  | 'LYING'
  | 'WALKING'
  | 'RUNNING'
  | 'FALL'
  | 'NO_MOVEMENT';

export interface IMotionFeatures {
  stepDelta: number;
  timeDeltaMs: number;
  stepVelocity: number; // steps per second
  heartRateValue: number;
  isStepIncrementing: boolean;
}

export interface IPostureFeatures {
  inferredPosture: 'UNKNOWN' | 'STANDING' | 'SITTING' | 'LYING';
}

export interface IActivityState {
  timestamp: number;
  currentActivity: UserActivity;
  confidence: number; // 0.0 to 1.0
  durationInCurrentActivityMs: number;
}

export interface IActivityEngine {
  processActivityWindow(
    healthSnapshot: { timestamp: number; heartRate: number; steps: number }[]
  ): IActivityState;
  reset(): void;
}