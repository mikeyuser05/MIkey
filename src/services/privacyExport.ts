/**
 * PR7.7: Privacy Export and Controls Service
 * Handles privacy-conscious exports, selective field masking, and database purge operations.
 */

import { DailyHealthRecord, PrivacyExportConfig } from "../types/healthHistory";
import { DailyRecordManager } from "./dailyRecordManager";
import { WeeklyRecordManager } from "./weeklyRecordManager";
import { MonthlyRecordManager } from "./monthlyRecordManager";
import { HealthTimelineManager } from "./healthTimeline";

export class PrivacyExportService {
    private dailyManager: DailyRecordManager;
    private weeklyManager: WeeklyRecordManager;
    private monthlyManager: MonthlyRecordManager;
    private timelineManager: HealthTimelineManager;

    constructor() {
        this.dailyManager = new DailyRecordManager();
        this.weeklyManager = new WeeklyRecordManager();
        this.monthlyManager = new MonthlyRecordManager();
        this.timelineManager = new HealthTimelineManager();
    }

    /**
     * Sanitizes daily health records based on privacy configurations
     */
    public sanitizeDailyRecords(
        records: DailyHealthRecord[],
        config: PrivacyExportConfig
    ): Partial<DailyHealthRecord>[] {
        return records.map((record) => {
            const sanitized: Partial<DailyHealthRecord> = {
                id: record.id,
                userId: config.anonymizeUserId ? "ANONYMOUS_USER" : record.userId,
                dateIso: record.dateIso,
                updatedAt: record.updatedAt
            };

            if (config.includeVitals) {
                sanitized.vitals = record.vitals;
                sanitized.stressScore = record.stressScore;
                sanitized.recoveryScore = record.recoveryScore;
            }

            if (config.includeActivity) {
                sanitized.activity = record.activity;
            }

            if (config.includeAnomalies) {
                sanitized.anomalyCount = record.anomalyCount;
            }

            return sanitized;
        });
    }

    /**
     * Converts sanitized records into a flat CSV format
     */
    public exportToCsv(sanitizedRecords: Partial<DailyHealthRecord>[]): string {
        if (sanitizedRecords.length === 0) return "";

        const headers = ["id", "userId", "dateIso"];

        if (sanitizedRecords[0].vitals) {
            headers.push("hr_avg", "hr_min", "hr_max", "spO2_avg", "restingHr", "recoveryScore");
        }
        if (sanitizedRecords[0].activity) {
            headers.push("totalSteps", "activeMinutes", "caloriesBurned");
        }
        if (sanitizedRecords[0].anomalyCount !== undefined) {
            headers.push("anomalyCount");
        }

        const rows = sanitizedRecords.map((rec) => {
            const row: any[] = [rec.id, rec.userId, rec.dateIso];

            if (rec.vitals) {
                row.push(
                    rec.vitals.heartRate.average,
                    rec.vitals.heartRate.min,
                    rec.vitals.heartRate.max,
                    rec.vitals.spO2.average,
                    rec.vitals.restingHeartRate,
                    rec.recoveryScore
                );
            }
            if (rec.activity) {
                row.push(rec.activity.totalSteps, rec.activity.activeMinutes, rec.activity.estimatedCaloriesBurned);
            }
            if (rec.anomalyCount !== undefined) {
                row.push(rec.anomalyCount);
            }

            return row.map((v) => `"${v}"`).join(",");
        });

        return [headers.join(","), ...rows].join("\n");
    }

    /**
     * Executes a complete GDPR/CCPA data purge for a user across all health history tables
     */
    public async purgeAllUserData(userId: string): Promise<void> {
        await this.dailyManager.clearUserRecords(userId);
        await this.weeklyManager.clearUserRecords(userId);
        await this.monthlyManager.clearUserRecords(userId);
        await this.timelineManager.clearUserEvents(userId);
    }
}
