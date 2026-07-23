/**
 * PR9.3: Structured Context Retrieval Service
 * Selects targeted daily records and timeline events based on query analysis.
 */

import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { UserHealthBaseline } from "../types/aiContext";
import { QueryAnalysisResult } from "./healthQueryAnalyzer";

export interface RetrievedHealthContext {
    relevantRecords: DailyHealthRecord[];
    relevantEvents: HealthTimelineEvent[];
    baselineSummary: UserHealthBaseline;
    matchedMetrics: string[];
}

export class StructuredContextRetriever {
    /**
     * Filters physiological history based on intent and entities extracted from the query
     */
    public retrieveContext(
        analysis: QueryAnalysisResult,
        baseline: UserHealthBaseline,
        records: DailyHealthRecord[],
        events: HealthTimelineEvent[]
    ): RetrievedHealthContext {
        const { timeframeKeywords, metricTypes } = analysis.entities;

        // 1. Filter Records by Timeframe
        let filteredRecords = [...records];

        if (timeframeKeywords.includes("TODAY") && records.length > 0) {
            filteredRecords = records.slice(-1); // Most recent record
        } else if (timeframeKeywords.includes("PAST_7_DAYS")) {
            filteredRecords = records.slice(-7);
        }

        // 2. Filter Events by Relevance
        const relevantEvents = events.filter(e => {
            const titleLower = e.title.toLowerCase();
            return metricTypes.some(m => titleLower.includes(m.toLowerCase()));
        });

        return {
            relevantRecords: filteredRecords,
            relevantEvents,
            baselineSummary: baseline,
            matchedMetrics: metricTypes
        };
    }
}
