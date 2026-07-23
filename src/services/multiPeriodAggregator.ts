/**
 * PR6.3: Weekly and Monthly Aggregation Service
 * Rolls up daily analytics records into weekly and monthly trends.
 */

import { AnalyticsRecord, TimeBucket, MetricSummary, AggregatedTelemetry, StabilityAndRecoveryMetrics } from "../types/analytics";
import { AnalyticsStorageService } from "./analyticsStorage";
import { UserContextState } from "./contextualBaseline";

export class MultiPeriodAggregatorService {
    private storageService: AnalyticsStorageService;

    constructor() {
        this.storageService = new AnalyticsStorageService();
    }

    /**
     * Combines multiple MetricSummary instances weighted by sample count
     */
    private combineSummaries(summaries: MetricSummary[]): MetricSummary {
        const validSummaries = summaries.filter((s) => s.sampleCount > 0);
        if (validSummaries.length === 0) {
            return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0, sampleCount: 0 };
        }

        let min = validSummaries[0].min;
        let max = validSummaries[0].max;
        let totalSamples = 0;
        let weightedMeanSum = 0;

        validSummaries.forEach((s) => {
            if (s.min < min) min = s.min;
            if (s.max > max) max = s.max;
            totalSamples += s.sampleCount;
            weightedMeanSum += s.mean * s.sampleCount;
        });

        const mean = totalSamples > 0 ? weightedMeanSum / totalSamples : 0;

        // Combined standard deviation estimation
        let totalVarianceSum = 0;
        validSummaries.forEach((s) => {
            totalVarianceSum += Math.pow(s.stdDev, 2) * s.sampleCount;
        });
        const stdDev = totalSamples > 0 ? Math.sqrt(totalVarianceSum / totalSamples) : 0;

        // Approximate median using average of medians
        const avgMedian = validSummaries.reduce((acc, s) => acc + s.median, 0) / validSummaries.length;

        return {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            mean: parseFloat(mean.toFixed(2)),
            median: parseFloat(avgMedian.toFixed(2)),
            stdDev: parseFloat(stdDev.toFixed(2)),
            sampleCount: totalSamples
        };
    }

    /**
     * Aggregates a set of daily records into a target bucket (WEEKLY or MONTHLY)
     */
    public aggregateDailyRecords(
        userId: string,
        bucketType: TimeBucket,
        periodIdentifier: string, // e.g. "2026-W30" or "2026-07"
        dailyRecords: AnalyticsRecord[]
    ): AnalyticsRecord {
        if (dailyRecords.length === 0) {
            throw new Error("Cannot aggregate an empty set of daily records.");
        }

        const sortedDaily = [...dailyRecords].sort((a, b) => a.windowStartIso.localeCompare(b.windowStartIso));
        const windowStartIso = sortedDaily[0].windowStartIso;
        const windowEndIso = sortedDaily[sortedDaily.length - 1].windowEndIso;

        // Extract Metric Summaries
        const hrSummaries = sortedDaily.map((r) => r.telemetry.heartRate);
        const spO2Summaries = sortedDaily.map((r) => r.telemetry.spO2);
        const accelSummaries = sortedDaily.map((r) => r.telemetry.accelMagnitude);

        const combinedHr = this.combineSummaries(hrSummaries);
        const combinedSpO2 = this.combineSummaries(spO2Summaries);
        const combinedAccel = this.combineSummaries(accelSummaries);

        // Sum totals and calculate weighted data quality ratio
        const totalStepCount = sortedDaily.reduce((acc, r) => acc + r.telemetry.totalStepCount, 0);
        const totalQuality = sortedDaily.reduce((acc, r) => acc + r.telemetry.dataQualityRatio, 0);
        const dataQualityRatio = parseFloat((totalQuality / sortedDaily.length).toFixed(3));

        const totalAnomalies = sortedDaily.reduce((acc, r) => acc + r.anomalyCount, 0);

        // Compute average stability metrics
        const avgRhr = sortedDaily.reduce((acc, r) => acc + r.stability.restingHeartRate, 0) / sortedDaily.length;
        const avgSpO2Stability = sortedDaily.reduce((acc, r) => acc + r.stability.spO2StabilityScore, 0) / sortedDaily.length;
        const avgRecoveryRate = sortedDaily.reduce((acc, r) => acc + r.stability.postActivityRecoveryRateBpmPerMin, 0) / sortedDaily.length;
        const avgStress = sortedDaily.reduce((acc, r) => acc + r.stability.stressProxyIndex, 0) / sortedDaily.length;

        const telemetrySummary: AggregatedTelemetry = {
            heartRate: combinedHr,
            spO2: combinedSpO2,
            accelMagnitude: combinedAccel,
            totalStepCount,
            dataQualityRatio
        };

        const stabilityMetrics: StabilityAndRecoveryMetrics = {
            restingHeartRate: parseFloat(avgRhr.toFixed(1)),
            spO2StabilityScore: parseFloat(avgSpO2Stability.toFixed(2)),
            postActivityRecoveryRateBpmPerMin: parseFloat(avgRecoveryRate.toFixed(1)),
            stressProxyIndex: parseFloat(avgStress.toFixed(2))
        };

        const recordId = `${userId}_${bucketType}_${periodIdentifier}`;

        return {
            id: recordId,
            userId,
            bucketType,
            windowStartIso,
            windowEndIso,
            telemetry: telemetrySummary,
            stability: stabilityMetrics,
            primaryContext: "RESTING",
            anomalyCount: totalAnomalies,
            updatedAt: Date.now()
        };
    }

    /**
     * Fetches daily records from IndexedDB and generates/persists a weekly or monthly summary
     */
    public async generateAndSaveMultiPeriodRecord(
        userId: string,
        bucketType: TimeBucket,
        periodIdentifier: string
    ): Promise<AnalyticsRecord> {
        const dailyRecords = await this.storageService.getRecords(userId, "DAILY");
        if (dailyRecords.length === 0) {
            throw new Error(`No daily records found for user ${userId} to perform ${bucketType} aggregation.`);
        }

        const aggregatedRecord = this.aggregateDailyRecords(userId, bucketType, periodIdentifier, dailyRecords);
        await this.storageService.saveRecord(aggregatedRecord);
        return aggregatedRecord;
    }
}
