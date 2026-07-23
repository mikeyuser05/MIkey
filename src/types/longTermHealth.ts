/**
 * PR10.2: Long-Term Personal Health Model Types
 * Defines multi-month longitudinal baselines, macro-trends, and physiological drift.
 */

export interface PhysiologicalBaseline30D {
    restingHeartRateMean: number;
    restingHeartRateStdDev: number;
    spO2Mean: number;
    sleepDurationHoursMean: number;
    dailyStepMean: number;
    stressScoreMean: number;
}

export interface MacroHealthTrend {
    metric: "RHR" | "SPO2" | "STEPS" | "STRESS" | "SLEEP";
    direction: "IMPROVING" | "STABLE" | "DECLINING";
    percentageChange: number;
    timeframeDays: number;
    confidenceScore: number;
}

export interface LongitudinalHealthProfile {
    userId: string;
    computedAt: number;
    baseline30D: PhysiologicalBaseline30D;
    macroTrends: MacroHealthTrend[];
    detectedDrifts: string[];
}
