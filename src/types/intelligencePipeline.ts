/**
 * Build 5.7: Real-Time Intelligence Orchestrator
 * Domain Types & Pipeline Payload Interfaces
 */

import { ContextInputData, UserContextState, ScaledBaseline } from "./contextualBaseline";

export interface TelemetryPayload {
    userId: string;
    timestamp: number;
    heartRate: number;
    accelMagnitude: number;
    stepCount: number;
    hourOfDay: number;
}

export interface DeviationAssessment {
    isAnomaly: boolean;
    deviationScore: number; // Normalized deviation distance from limits (-1.0 to 1.0, where 0 is normal)
    severity: "NORMAL" | "ELEVATED" | "CRITICAL";
}

export interface IntelligenceOutputPayload {
    userId: string;
    timestamp: number;
    rawHeartRate: number;
    contextState: UserContextState;
    baseline: ScaledBaseline;
    assessment: DeviationAssessment;
    isValidated: boolean;
}
