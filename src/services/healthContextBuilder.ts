/**
 * PR8.2: Structured Health Context Builder Service
 * Compiles and prunes user health history into a token-budgeted AI Context Window.
 */

import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { AIContextWindow, ContextTokenBudget, UserHealthBaseline } from "../types/aiContext";

export class HealthContextBuilder {
    private defaultBudget: ContextTokenBudget = {
        maxTokens: 2048,
        vitalsAllocation: 0.40,
        baselineAllocation: 0.30,
        timelineAllocation: 0.20,
        systemPromptReserve: 0.10
    };

    /**
     * Estimates token count using standard heuristic (~4 chars per token)
     */
    public estimateTokens(payload: object | string): number {
        const str = typeof payload === "string" ? payload : JSON.stringify(payload);
        return Math.ceil(str.length / 4);
    }

    /**
     * Obfuscates user identifier for privacy preservation
     */
    private anonymizeSubjectId(userId: string): string {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = (hash << 5) - hash + userId.charCodeAt(i);
            hash |= 0;
        }
        return `SUBJ_${Math.abs(hash).toString(16).toUpperCase()}_ANON`;
    }

    /**
     * Builds a token-budgeted AIContextWindow from raw health records
     */
    public buildContextWindow(
        userId: string,
        baseline: UserHealthBaseline,
        dailyRecords: DailyHealthRecord[],
        timelineEvents: HealthTimelineEvent[],
        customBudget?: Partial<ContextTokenBudget>
    ): AIContextWindow {
        const budget = { ...this.defaultBudget, ...customBudget };
        const maxContentTokens = Math.floor(budget.maxTokens * (1 - budget.systemPromptReserve));

        const subjectId = this.anonymizeSubjectId(userId);
        const sortedRecords = [...dailyRecords].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
        const sortedEvents = [...timelineEvents].sort((a, b) => b.timestamp - a.timestamp);

        const currentSnapshot = sortedRecords.length > 0 ? sortedRecords[0] : undefined;
        const historicalRecords: DailyHealthRecord[] = [];
        const recentEvents: HealthTimelineEvent[] = [];

        // Fit daily records within vitals allocation budget
        const vitalsTokenLimit = Math.floor(maxContentTokens * budget.vitalsAllocation);
        let currentVitalsTokens = 0;

        for (const record of sortedRecords) {
            const tokenCost = this.estimateTokens(record);
            if (currentVitalsTokens + tokenCost <= vitalsTokenLimit) {
                historicalRecords.push(record);
                currentVitalsTokens += tokenCost;
            } else {
                break;
            }
        }

        // Fit timeline events within timeline allocation budget (prioritizing anomaly alerts)
        const timelineTokenLimit = Math.floor(maxContentTokens * budget.timelineAllocation);
        let currentTimelineTokens = 0;

        // Prioritize anomalies first
        const prioritizedEvents = [
            ...sortedEvents.filter((e) => e.type === "ANOMALY_ALERT"),
            ...sortedEvents.filter((e) => e.type !== "ANOMALY_ALERT")
        ];

        for (const event of prioritizedEvents) {
            const tokenCost = this.estimateTokens(event);
            if (currentTimelineTokens + tokenCost <= timelineTokenLimit) {
                recentEvents.push(event);
                currentTimelineTokens += tokenCost;
            } else {
                break;
            }
        }

        const contextWindow: AIContextWindow = {
            userContext: {
                subjectId,
                baseline
            },
            currentSnapshot,
            historicalRecords,
            recentEvents,
            generatedAt: Date.now(),
            estimatedTokenCount: 0
        };

        contextWindow.estimatedTokenCount = this.estimateTokens(contextWindow);
        return contextWindow;
    }
}
