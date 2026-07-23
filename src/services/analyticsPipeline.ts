/**
 * PR6.8: Master Analytics Pipeline Coordinator
 * Orchestrates the end-to-end execution flow across all PR6 sub-modules.
 */

import { TelemetryPayload } from "../types/intelligencePipeline";
import { AnalyticsRecord, TimeBucket } from "../types/analytics";
import { ContextualBaselineEngine, UserContextState } from "./contextualBaseline";
import { DailyRollupAggregator } from "./dailyRollup";
import { MultiPeriodAggregatorService } from "./multiPeriodAggregator";
import { TrendEngine } from "./trendEngine";
import { RecoveryEvaluator } from "./recoveryEvaluator";
import { AnomalyEngine } from "./anomalyEngine";
import { AnalyticsStorageService } from "./analyticsStorage";
import { TrendAnalysisReport } from "../types/trends";
import { MultiMetricAnomalyAssessment } from "../types/anomaly";

export class AnalyticsPipelineCoordinator {
    private baselineEngine: ContextualBaselineEngine;
    private dailyRollup: DailyRollupAggregator;
    private multiPeriodAggregator: MultiPeriodAggregatorService;
    private trendEngine: TrendEngine;
    private recoveryEvaluator: RecoveryEvaluator;
    private anomalyEngine: AnomalyEngine;
    private storageService: AnalyticsStorageService;

    constructor() {
        this.baselineEngine = new ContextualBaselineEngine();
        this.dailyRollup = new DailyRollupAggregator();
        this.multiPeriodAggregator = new MultiPeriodAggregatorService();
        this.trendEngine = new TrendEngine();
        this.recoveryEvaluator = new RecoveryEvaluator();
        this.anomalyEngine = new AnomalyEngine();
        this.storageService = new AnalyticsStorageService();
    }

    /**
     * Processes a single telemetry frame for real-time anomaly detection and context evaluation
     */
    public processFrame(
        telemetry: TelemetryPayload,
        spO2Value: number,
        dataQualityRatio: number
    ): MultiMetricAnomalyAssessment {
        const context: UserContextState = telemetry.accelMagnitude > 12.0 ? "ACTIVE" : "RESTING";
        const baseline = this.baselineEngine.getBaseline(telemetry.userId, context, telemetry.hourOfDay);

        return this.anomalyEngine.evaluateTelemetry(
            telemetry,
            spO2Value,
            baseline.heartRateMean,
            baseline.heartRateStdDev,
            98.0,
            1.0,
            dataQualityRatio
        );
    }

    /**
     * End-to-end processing pass: Ingests raw frames, computes daily record, aggregates, and analyzes trends
     */
    public async processDailyBatchAndAggregate(
        userId: string,
        dateIso: string,
        telemetryFrames: TelemetryPayload[],
        spO2Readings: number[]
    ): Promise<{
        dailyRecord: AnalyticsRecord;
        trendReport?: TrendAnalysisReport;
    }> {
        // 1. Process Daily Rollup
        const dailyRecord = this.dailyRollup.processDay(userId, dateIso, telemetryFrames, spO2Readings);
        await this.storageService.saveRecord(dailyRecord);

        // 2. Fetch overall history for trend detection
        const allDailyRecords = await this.storageService.getRecords(userId, "DAILY");

        let trendReport: TrendAnalysisReport | undefined;
        if (allDailyRecords.length >= 2) {
            trendReport = this.trendEngine.analyzeTrends(userId, allDailyRecords);
        }

        return {
            dailyRecord,
            trendReport
        };
    }
}
