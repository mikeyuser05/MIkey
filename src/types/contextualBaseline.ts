/**
 * Build 5.6: Activity and Context-Aware Baseline Engine
 * Domain Types & Interfaces
 */

export enum UserContextState {
    RESTING = "RESTING",
    ACTIVE = "ACTIVE",
    SLEEPING = "SLEEPING",
    UNKNOWN = "UNKNOWN"
}

export interface ContextInputData {
    accelMagnitude: number; // Vector magnitude from accelerometer (m/s^2 or g)
    hourOfDay: number;      // 0 to 23
    stepCount: number;      // Recent step count delta
}

export interface BaselineRange {
    minBpm: number;
    maxBpm: number;
}

export interface ScaledBaseline {
    state: UserContextState;
    dynamicMinBpm: number;
    dynamicMaxBpm: number;
    scalingFactor: number;
}
