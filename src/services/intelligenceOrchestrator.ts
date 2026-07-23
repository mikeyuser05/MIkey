/**
 * Build 5.7: Real-Time Intelligence Orchestrator
 * Core Pipeline Service
 */

import { TelemetryPayload, IntelligenceOutputPayload, DeviationAssessment } from "../types/intelligencePipeline";
import { BaselineEngine } from "./baselineEngine";

export class IntelligenceOrchestrator {
    private baselineEngine: BaselineEngine;

    constructor() {
        this.baselineEngine = new BaselineEngine(60.0, 100.0);
    }

    /**
     * Validates incoming telemetry payload basic sanity checks
     */
    private validateDataQuality(payload: TelemetryPayload): boolean {
        if (!payload.userId || payload.timestamp <= 0) return false;
        if (payload.heartRate < 30 || payload.heartRate > 220) return false; // Basic biological sanity check
        if (payload.accelMagnitude < 0) return false;
        return true;
    }

    /**
     * Calculates deviation score and severity based on dynamic thresholds
     */
    private evaluateDeviation(bpm: number, dynamicMin: number, dynamicMax: number): DeviationAssessment {
        if (bpm >= dynamicMin && bpm <= dynamicMax) {
            return {
                isAnomaly: false,
                deviationScore: 0.0,
                severity: "NORMAL"
            };
        }

        let score = 0;
        if (bpm > dynamicMax) {
            score = (bpm - dynamicMax) / dynamicMax;
        } else {
            score = (dynamicMin - bpm) / dynamicMin;
        }

        const severity = score > 0.35 ? "CRITICAL" : "ELEVATED";

        return {
            isAnomaly: true,
            deviationScore: parseFloat(score.toFixed(2)),
            severity
        };
    }

    /**
     * Main execution pipeline: Ingests raw telemetry and outputs context-aware health intelligence
     */
    public processTelemetry(payload: TelemetryPayload): IntelligenceOutputPayload {
        const isValid = this.validateDataQuality(payload);

        if (!isValid) {
            return {
                userId: payload.userId,
                timestamp: payload.timestamp,
                rawHeartRate: payload.heartRate,
                contextState: this.baselineEngine.inferContext({
                    accelMagnitude: payload.accelMagnitude,
                    hourOfDay: payload.hourOfDay,
                    stepCount: payload.stepCount
                }),
                baseline: {
                    state: this.baselineEngine.inferContext({
                        accelMagnitude: payload.accelMagnitude,
                        hourOfDay: payload.hourOfDay,
                        stepCount: payload.stepCount
                    }),
                    dynamicMinBpm: 60,
                    dynamicMaxBpm: 100,
                    scalingFactor: 1.0
                },
                assessment: { isAnomaly: true, deviationScore: 1.0, severity: "CRITICAL" },
                isValidated: false
            };
        }

        const contextInput = {
            accelMagnitude: payload.accelMagnitude,
            hourOfDay: payload.hourOfDay,
            stepCount: payload.stepCount
        };

        // 1. Infer Context & Dynamic Baseline (Build 5.6 Engine)
        const baseline = this.baselineEngine.calculateDynamicBaseline(contextInput);

        // 2. Compute Deviation Assessment
        const assessment = this.evaluateDeviation(
            payload.heartRate,
            baseline.dynamicMinBpm,
            baseline.dynamicMaxBpm
        );

        // 3. Assemble Pipeline Intelligence Output
        return {
            userId: payload.userId,
            timestamp: payload.timestamp,
            rawHeartRate: payload.heartRate,
            contextState: baseline.state,
            baseline,
            assessment,
            isValidated: true
        };
    }
}
