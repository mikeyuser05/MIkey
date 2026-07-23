/**
 * PR7.2: Daily Health Record Manager Service
 * Transforms and manages DailyHealthRecord snapshots stored in Dexie.js IndexedDB.
 */

import Dexie, { Table } from "dexie";
import { DailyHealthRecord } from "../types/healthHistory";
import { AnalyticsRecord } from "../types/analytics";

class DailyRecordDatabase extends Dexie {
    dailyHealthRecords!: Table<DailyHealthRecord, string>;

    constructor() {
        super("DailyHealthRecordDatabase");
        this.version(1).stores({
            dailyHealthRecords: "id, userId, dateIso, [userId+dateIso]"
        });
    }
}

export class DailyRecordManager {
    private db: DailyRecordDatabase;

    constructor() {
        this.db = new DailyRecordDatabase();
    }

    /**
     * Converts a PR6 AnalyticsRecord into a PR7 DailyHealthRecord
     */
    public transformAnalyticsToDailyRecord(analytics: AnalyticsRecord): DailyHealthRecord {
        const dateIso = analytics.windowStartIso.split("T")[0];

        // Recovery score formula (0-100 scale based on recovery rate and stability)
        const recoveryScore = Math.min(
            100,
            Math.max(0, (analytics.stability.postActivityRecoveryRateBpmPerMin / 30) * 100)
        );

        // Active minutes estimation based on steps (approx. 100 steps/min during activity)
        const activeMinutes = Math.round(analytics.telemetry.totalStepCount / 100);

        // Estimated calorie burn (rough baseline: steps * 0.04 + active minutes * 4)
        const caloriesBurned = Math.round(analytics.telemetry.totalStepCount * 0.04 + activeMinutes * 4);

        return {
            id: `${analytics.userId}_DAILY_${dateIso}`,
            userId: analytics.userId,
            dateIso,
            vitals: {
                heartRate: {
                    min: analytics.telemetry.heartRate.min,
                    max: analytics.telemetry.heartRate.max,
                    average: analytics.telemetry.heartRate.mean
                },
                spO2: {
                    min: analytics.telemetry.spO2.min,
                    max: analytics.telemetry.spO2.max,
                    average: analytics.telemetry.spO2.mean
                },
                restingHeartRate: analytics.stability.restingHeartRate
            },
            activity: {
                totalSteps: analytics.telemetry.totalStepCount,
                activeMinutes,
                estimatedCaloriesBurned: caloriesBurned
            },
            anomalyCount: analytics.anomalyCount,
            stressScore: analytics.stability.stressProxyIndex,
            recoveryScore: parseFloat(recoveryScore.toFixed(1)),
            dataQualityRatio: analytics.telemetry.dataQualityRatio,
            updatedAt: Date.now()
        };
    }

    /**
     * Saves or updates a DailyHealthRecord in Dexie.js
     */
    public async saveDailyRecord(record: DailyHealthRecord): Promise<string> {
        return await this.db.dailyHealthRecords.put(record);
    }

    /**
     * Fetches a DailyHealthRecord for a given user and date
     */
    public async getDailyRecord(userId: string, dateIso: string): Promise<DailyHealthRecord | undefined> {
        return await this.db.dailyHealthRecords.get(`${userId}_DAILY_${dateIso}`);
    }

    /**
     * Retrieves daily records within a given date range
     */
    public async getDailyRecordsRange(userId: string, startDateIso: string, endDateIso: string): Promise<DailyHealthRecord[]> {
        return await this.db.dailyHealthRecords
            .where("userId")
            .equals(userId)
            .filter((rec) => rec.dateIso >= startDateIso && rec.dateIso <= endDateIso)
            .toArray();
    }

    /**
     * Clears all daily records for a specific user
     */
    public async clearUserRecords(userId: string): Promise<void> {
        const records = await this.db.dailyHealthRecords.where("userId").equals(userId).toArray();
        const ids = records.map((r) => r.id);
        await this.db.dailyHealthRecords.bulkDelete(ids);
    }
}
