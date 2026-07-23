/**
 * Build 5.6: Activity and Context-Aware Baseline Engine
 * Core Engine Service
 */

import { 
    UserContextState, 
    ContextInputData, 
    BaselineRange, 
    ScaledBaseline 
} from "../types/contextualBaseline";

export class BaselineEngine {
    private restingBaseline: BaselineRange;

    constructor(defaultMinBpm: number = 60.0, defaultMaxBpm: number = 100.0) {
        this.restingBaseline = {
            minBpm: defaultMinBpm,
            maxBpm: defaultMaxBpm
        };
    }

    /**
     * Infers context state based on movement and time variables
     */
    public inferContext(input: ContextInputData): UserContextState {
        // High motion threshold -> ACTIVE
        if (input.accelMagnitude > 12.5 || input.stepCount > 15) {
            return UserContextState.ACTIVE;
        }

        // Nighttime window (11 PM - 6 AM) with minimal motion -> SLEEPING
        if ((input.hourOfDay >= 23 || input.hourOfDay < 6) && input.accelMagnitude < 10.0) {
            return UserContextState.SLEEPING;
        }

        return UserContextState.RESTING;
    }

    /**
     * Calculates dynamically scaled baseline thresholds
     */
    public calculateDynamicBaseline(input: ContextInputData): ScaledBaseline {
        const state = this.inferContext(input);

        let scalingFactor = 1.0;
        let dynamicMinBpm = this.restingBaseline.minBpm;
        let dynamicMaxBpm = this.restingBaseline.maxBpm;

        switch (state) {
            case UserContextState.ACTIVE:
                scalingFactor = 1.8;
                dynamicMinBpm = this.restingBaseline.minBpm * 1.1;
                dynamicMaxBpm = this.restingBaseline.maxBpm * scalingFactor;
                break;

            case UserContextState.SLEEPING:
                scalingFactor = 0.85;
                dynamicMinBpm = this.restingBaseline.minBpm * 0.75;
                dynamicMaxBpm = this.restingBaseline.maxBpm * scalingFactor;
                break;

            case UserContextState.RESTING:
            case UserContextState.UNKNOWN:
            default:
                scalingFactor = 1.0;
                break;
        }

        return {
            state,
            dynamicMinBpm,
            dynamicMaxBpm,
            scalingFactor
        };
    }

    /**
     * Evaluates whether a current reading is an active anomaly
     */
    public isAnomaly(currentBpm: number, baseline: ScaledBaseline): boolean {
        return currentBpm < baseline.dynamicMinBpm || currentBpm > baseline.dynamicMaxBpm;
    }
}
