/**
 * PR7.8: Health History Pipeline Coordinator
 * Integrates daily, weekly, and monthly health recording, timeline tracking, and reporting.
 */

import { AnalyticsRecord } from "../types/analytics";
import {
    DailyHealthRecord,
    WeeklyHealthRecord,
    MonthlyHealthRecord,
    HealthTimelineEvent,
    HealthReportPayload,
    PrivacyExportConfig
} from "../types/healthHistory";
import { DailyRecordManager } from "./dailyRecordManager";
import { WeeklyRecordManager } from "./weeklyRecordManager";
import { MonthlyRecordManager } from "./monthlyRecordManager";
import { HealthTimelineManager } from "./healthTimeline";
import { ReportGeneratorService } from "./reportGenerator";
import { PrivacyExportService } from "./privacyExport";

export class HealthHistoryPipelineCoordinator {
    private dailyManager: DailyRecordManager;
    private weeklyManager: WeeklyRecordManager;
    private monthlyManager: MonthlyRecordManager;
    private timelineManager: HealthTimelineManager;
    private reportGenerator: ReportGeneratorService;
    private privacyService: PrivacyExportService;

    constructor() {
        this.dailyManager = new DailyRecordManager();
        this.weeklyManager = new WeeklyRecordManager();
        this.monthlyManager = new MonthlyRecordManager();
        this.timelineManager = new HealthTimelineManager();
        this.reportGenerator = new ReportGeneratorService();
        this.privacyService = new PrivacyExportService();
    }

    /**
     * Ingests a PR6 AnalyticsRecord into the PR7 Health History ecosystem
     */
    public async processAnalyticsIngest(
        analyticsRecord: AnalyticsRecord,
        weekIdentifier: string,
        monthIdentifier: string
    ): Promise<{
        dailyRecord: DailyHealthRecord;
        weeklyRecord?: WeeklyHealthRecord;
        monthlyRecord?: MonthlyHealthRecord;
    }> {
        // 1. Convert and save daily health record
        const dailyRecord = this.dailyManager.transformAnalyticsToDailyRecord(analyticsRecord);
        await this.dailyManager.saveDailyRecord(dailyRecord);

        // 2. Fetch all daily records within the week/month for aggregation
        const userId = analyticsRecord.userId;
        const allUserDailyRecords = await this.dailyManager.getDailyRecordsRange(
            userId,
            "2000-01-01",
            "2099-12-31"
        );

        // 3. Update Weekly Record
        let weeklyRecord: WeeklyHealthRecord | undefined;
        if (allUserDailyRecords.length > 0) {
            weeklyRecord = this.weeklyManager.aggregateWeeklyRecord(userId, weekIdentifier, allUserDailyRecords);
            await this.weeklyManager.saveWeeklyRecord(weeklyRecord);
        }

        // 4. Update Monthly Record
        let monthlyRecord: MonthlyHealthRecord | undefined;
        if (allUserDailyRecords.length > 0) {
            monthlyRecord = this.monthlyManager.aggregateMonthlyRecord(userId, monthIdentifier, allUserDailyRecords);
            await this.monthlyManager.saveMonthlyRecord(monthlyRecord);
        }

        // 5. Automatically log timeline event if anomalies were flagged
        if (dailyRecord.anomalyCount > 0) {
            const anomalyEvent: HealthTimelineEvent = {
                id: `EVT_ANOMALY_${dailyRecord.id}`,
                userId,
                timestamp: Date.now(),
                type: "ANOMALY_ALERT",
                severity: "HIGH",
                title: "Daily Anomaly Flagged",
                description: `Detected ${dailyRecord.anomalyCount} anomaly condition(s) on ${dailyRecord.dateIso}.`,
                metadata: { dateIso: dailyRecord.dateIso, anomalyCount: dailyRecord.anomalyCount }
            };
            await this.timelineManager.recordEvent(anomalyEvent);
        }

        return {
            dailyRecord,
            weeklyRecord,
            monthlyRecord
        };
    }

    /**
     * Generates a clinical health report for a given user across a date range
     */
    public async generateClinicalReport(
        userId: string,
        startDateIso: string,
        endDateIso: string
    ): Promise<HealthReportPayload> {
        const records = await this.dailyManager.getDailyRecordsRange(userId, startDateIso, endDateIso);
        return this.reportGenerator.generateReport(userId, records);
    }

    /**
     * Sanitizes and exports health data according to user privacy preferences
     */
    public async exportSanitizedData(
        userId: string,
        startDateIso: string,
        endDateIso: string,
        config: PrivacyExportConfig
    ): Promise<string> {
        const records = await this.dailyManager.getDailyRecordsRange(userId, startDateIso, endDateIso);
        const sanitized = this.privacyService.sanitizeDailyRecords(records, config);
        return this.privacyService.exportToCsv(sanitized);
    }

    /**
     * Purges all historical health records for a given user
     */
    public async purgeUserData(userId: string): Promise<void> {
        await this.privacyService.purgeAllUserData(userId);
    }
}
