/**
 * PR9.3: Structured Context Retrieval Verification Test
 */

import { StructuredContextRetriever } from "../services/structuredContextRetriever";
import { QueryAnalysisResult } from "../services/healthQueryAnalyzer";
import { DailyHealthRecord } from "../types/healthHistory";
import { UserHealthBaseline } from "../types/aiContext";

export async function runPR93Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.3 STRUCTURED CONTEXT RETRIEVAL TESTS");
    console.log("==================================================");

    const retriever = new StructuredContextRetriever();

    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 62.0,
        avgSpO2: 98.5,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 45
    };

    const mockRecords: DailyHealthRecord[] = [
        {
            id: "REC_01",
            userId: "USER_01",
            dateIso: "2026-07-23",
            vitals: { heartRate: { min: 60, max: 110, average: 68 }, spO2: { min: 97, max: 99, average: 98.2 }, restingHeartRate: 61.0 },
            activity: { totalSteps: 8500, activeMinutes: 40, estimatedCaloriesBurned: 400 },
            anomalyCount: 0,
            stressScore: 0.12,
            recoveryScore: 88.0,
            dataQualityRatio: 0.99,
            updatedAt: Date.now()
        },
        {
            id: "REC_02",
            userId: "USER_01",
            dateIso: "2026-07-24",
            vitals: { heartRate: { min: 62, max: 130, average: 75 }, spO2: { min: 96, max: 99, average: 98.0 }, restingHeartRate: 64.0 },
            activity: { totalSteps: 11200, activeMinutes: 55, estimatedCaloriesBurned: 510 },
            anomalyCount: 1,
            stressScore: 0.22,
            recoveryScore: 80.0,
            dataQualityRatio: 1.0,
            updatedAt: Date.now()
        }
    ];

    const mockAnalysis: QueryAnalysisResult = {
        rawQuery: "Show me my heart rate records for today.",
        intent: "VITAL_TREND_ANALYSIS",
        entities: {
            metricTypes: ["heart rate"],
            timeframeKeywords: ["TODAY"],
            symptoms: [],
            isEmergency: false
        },
        confidenceScore: 0.95
    };

    try {
        console.log("[TEST 1] Executing Context Retrieval for 'TODAY' timeframe...");
        const context = retriever.retrieveContext(mockAnalysis, baseline, mockRecords, []);

        console.log(`  ✓ Records Retrieved Count: ${context.relevantRecords.length}`);
        console.log(`    - Date of Retrieved Record: ${context.relevantRecords[0]?.dateIso}`);
        console.log(`    - Matched Metrics: [${context.matchedMetrics.join(", ")}]`);

        if (context.relevantRecords.length !== 1 || context.relevantRecords[0].dateIso !== "2026-07-24") {
            throw new Error("Context retrieval failed to isolate today's record.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR9.3 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR93Tests();
}
