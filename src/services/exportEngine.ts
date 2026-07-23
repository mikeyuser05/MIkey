/**
 * PR6.7: Analytics Export Engine Service
 * Generates structured JSON and CSV exports from IndexedDB analytics records.
 */

import { AnalyticsRecord } from "../types/analytics";
import { ExportOptions, ExportResult } from "../types/export";
import { AnalyticsStorageService } from "./analyticsStorage";

export class ExportEngine {
    private storageService: AnalyticsStorageService;

    constructor() {
        this.storageService = new AnalyticsStorageService();
    }

    /**
     * Converts an array of AnalyticsRecord objects into flat CSV rows
     */
    public convertToCsv(records: AnalyticsRecord[]): string {
        const headers = [
            "id",
            "userId",
            "bucketType",
            "windowStartIso",
            "windowEndIso",
            "hr_min",
            "hr_max",
            "hr_mean",
            "hr_median",
            "hr_stdDev",
            "spO2_mean",
            "totalStepCount",
            "dataQualityRatio",
            "restingHeartRate",
            "spO2StabilityScore",
            "stressProxyIndex",
            "anomalyCount"
        ];

        const rows = records.map((r) => [
            r.id,
            r.userId,
            r.bucketType,
            r.windowStartIso,
            r.windowEndIso,
            r.telemetry.heartRate.min,
            r.telemetry.heartRate.max,
            r.telemetry.heartRate.mean,
            r.telemetry.heartRate.median,
            r.telemetry.heartRate.stdDev,
            r.telemetry.spO2.mean,
            r.telemetry.totalStepCount,
            r.telemetry.dataQualityRatio,
            r.stability.restingHeartRate,
            r.stability.spO2StabilityScore,
            r.stability.stressProxyIndex,
            r.anomalyCount
        ]);

        const csvLines = [headers.join(",")];
        rows.forEach((row) => {
            csvLines.push(row.map((val) => `"${val}"`).join(","));
        });

        return csvLines.join("\n");
    }

    /**
     * Generates export payload based on requested options
     */
    public async exportRecords(options: ExportOptions): Promise<ExportResult> {
        let records = await this.storageService.getRecords(options.userId, options.bucketType);

        if (options.startIso) {
            records = records.filter((r) => r.windowStartIso >= options.startIso!);
        }
        if (options.endIso) {
            records = records.filter((r) => r.windowEndIso <= options.endIso!);
        }

        const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
        const bucketStr = options.bucketType ? options.bucketType.toLowerCase() : "all";

        if (options.format === "JSON") {
            const fileName = `analytics_${options.userId}_${bucketStr}_${timestampStr}.json`;
            return {
                fileName,
                mimeType: "application/json",
                content: JSON.stringify(records, null, 2),
                recordCount: records.length,
                exportedAt: Date.now()
            };
        } else {
            const fileName = `analytics_${options.userId}_${bucketStr}_${timestampStr}.csv`;
            const csvContent = this.convertToCsv(records);
            return {
                fileName,
                mimeType: "text/csv",
                content: csvContent,
                recordCount: records.length,
                exportedAt: Date.now()
            };
        }
    }
}
