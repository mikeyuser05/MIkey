/**
 * PR8.1: AI Context Architecture Types
 * Data models for token-budgeted, privacy-aware AI health context formatting.
 */

import { DailyHealthRecord, HealthTimelineEvent } from "./healthHistory";

export type AIModelTier = "FAST_REASONING" | "DEEP_CLINICAL";

export interface ContextTokenBudget {
    maxTokens: number;
    vitalsAllocation: number;   // e.g. 0.40 (40%)
    baselineAllocation: number; // e.g. 0.30 (30%)
    timelineAllocation: number; // e.g. 0.20 (20%)
    systemPromptReserve: number;// e.g. 0.10 (10%)
}

export interface UserHealthBaseline {
    avgRestingHeartRate: number;
    avgSpO2: number;
    dailyStepGoal: number;
    typicalActiveMinutes: number;
}

export interface AnonymizedUserContext {
    subjectId: string; // Hashed/Pseudonymized
    baseline: UserHealthBaseline;
}

export interface AIContextWindow {
    userContext: AnonymizedUserContext;
    currentSnapshot?: DailyHealthRecord;
    historicalRecords: DailyHealthRecord[];
    recentEvents: HealthTimelineEvent[];
    generatedAt: number;
    estimatedTokenCount: number;
}
