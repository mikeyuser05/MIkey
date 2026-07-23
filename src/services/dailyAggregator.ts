/**
 * PR6.2: Daily Aggregation Service
 * Computes daily statistical summaries, metric rollups, and quality ratios from raw telemetry.
 */

import { AnalyticsRecord, MetricSummary, AggregatedTelemetry, StabilityAndRecoveryMetrics } from "../types/analytics";
import { TelemetryPayload } from "../types/intelligencePipeline";
import { UserContextState } from "./contextualBaseline";
import { AnalyticsStorageService } from "./analyticsStorage";

export class DailyAggregatorService {
    private storageService: AnalyticsStorageService;

    constructor() {
        this.storageService = new AnalyticsStorageService();
    }

    /**
     * Calculates basic statistical properties (min, max, mean, median, stdDev) for a number array
     */
    private calculateStats(values: number[]): MetricSummary {
        if (values.length === 0) {
            return { min: 0, max: 0, mean: 0, median: 0, stdDev: 0, sampleCount: 0 };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        const mean = sum / sorted.length;

        // Median calculation
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

        // Standard deviation
        const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sorted.length;
        const stdDev = Math.sqrt(variance);

        return {
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            mean: parseFloat(mean.toFixed(2)),
            median: parseFloat(median.toFixed(2)),
            stdDev: parseFloat(stdDev.toFixed(2)),
            sampleCount: values.length
        };
    }

    /**
     * Aggregates raw telemetry samples for a single date (YYYY-MM-DD)
     */
    public processDailyTelemetry(
        userId: string,
        dateStr: string, // YYYY-MM-DD
        rawSamples: TelemetryPayload[],
        spO2Samples?: number[]
    ): AnalyticsRecord {
        const totalSamples = rawSamples.length;
        
        // Filter out corrupted/unrealistic sensor readings
        const validTelemetry = rawSamples.filter(
            (s) => s.heartRate >= 30 && s.heartRate <= 220 && s.accelMagnitude >= 0
        );

        const validCount = validTelemetry.length;
        const dataQualityRatio = totalSamples > 0 ? parseFloat((validCount / totalSamples).toFixed(3)) : 0;

        // Extract raw numerical arrays
        const hrValues = validTelemetry.map((s) => s.heartRate);
        const accelValues = validTelemetry.map((s) => s.accelMagnitude);
        const spO2Values = spO2Samples && spO2Samples.length > 0 
            ? spO2Samples.filter((v) => v >= 70 && v <= 100)
            : validTelemetry.map(() => 98); // Default nominal SpO2 fallback

        // Calculate step count delta/sum
        const totalStepCount = validTelemetry.reduce((acc, s) => acc + (s.stepCount || 0), 0);

        // Filter resting heart rate (when accel magnitude indicates low movement)
        const restingHrValues = validTelemetry
            .filter((s) => s.accelMagnitude >= 9.5 && s.accelMagnitude <= 10.2)
            .map((s) => s.heartRate);

        const hrStats = this.calculateStats(hrValues);
        const spO2Stats = this.calculateStats(spO2Values);
        const accelStats = this.calculateStats(accelValues);
        const restingStats = this.calculateStats(restingHrValues);

        const restingHeartRate = restingStats.sampleCount > 0 ? restingStats.median : hrStats.min;

        // Determine primary context state based on average motion
        let primaryContext: UserContextState = "RESTING";
        if (accelStats.mean > 13.0) {
            primaryContext = "ACTIVE";
        } else if (accelStats.mean < 9.7 && hrStats.mean < 65) {
            primaryContext = "SLEEPING";
        }

        const telemetrySummary: AggregatedTelemetry = {
            heartRate: hrStats,
            spO2: spO2Stats,
            accelMagnitude: accelStats,
            totalStepCount,
            dataQualityRatio
        };

        const stabilityMetrics: StabilityAndRecoveryMetrics = {
            restingHeartRate,
            spO2StabilityScore: parseFloat((1.0 - (spO2Stats.stdDev / 100)).toFixed(2)),
            postActivityRecoveryRateBpmPerMin: 15.0, // Baseline nominal recovery rate
            stressProxyIndex: parseFloat((hrStats.stdDev / 30.0).toFixed(2))
        };

        const recordId = `${userId}_DAILY_${dateStr}`;
        const record: AnalyticsRecord = {
            id: recordId,
            userId,
            bucketType: "DAILY",
            windowStartIso: `${dateStr}T00:00:00.000Z`,
            windowEndIso: `${dateStr}T23:59:59.999Z`,
            telemetry: telemetrySummary,
            stability: stabilityMetrics,
            primaryContext,
            anomalyCount: 0,
            updatedAt: Date.now()
        };

        return record;
    }

    /**
     * Executes aggregation and persists record into Dexie IndexedDB
     */
    public async generateAndSaveDailyRecord(
        userId: string,
        dateStr: string,
        rawSamples: TelemetryPayload[],
        spO2Samples?: number[]
    ): Promise<AnalyticsRecord> {
        const record = this.processDailyTelemetry(userId, dateStr, rawSamples, spO2Samples);
        await this.storageService.saveRecord(record);
        return record;
    }
}
