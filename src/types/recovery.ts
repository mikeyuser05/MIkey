/**
 * PR6.5: Stability & Recovery Metrics Types
 */

export interface PostActivityRecoveryResult {
    peakHeartRate: number;
    recoveredHeartRate: number;
    recoveryDropBpm: number;
    timeElapsedSeconds: number;
    recoveryRateBpmPerMin: number;
    recoveryQuality: "EXCELLENT" | "GOOD" | "SLUGGISH" | "POOR";
}

export interface SpO2StabilityAssessment {
    stabilityScore: number; // 0.0 to 1.0
    meanSpO2: number;
    minimumSpO2: number;
    hypoxicDipCount: number; // Readings < 95%
    isStable: boolean;
}

export interface ComprehensiveStabilityProfile {
    userId: string;
    timestamp: number;
    recovery: PostActivityRecoveryResult;
    spO2Assessment: SpO2StabilityAssessment;
    stressProxyIndex: number; // 0.0 (low stress) to 1.0 (high stress)
}
