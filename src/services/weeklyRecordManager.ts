/**
 * PR7.3: Weekly Health Record Manager Service
 * Aggregates DailyHealthRecord snapshots into WeeklyHealthRecord summaries stored in Dexie.js.
 */

import Dexie, { Table } from "dexie";
import { DailyHealthRecord, WeeklyHealthRecord } from "../types/healthHistory";

class WeeklyRecordDatabase extends Dexie {
    weeklyHealthRecords!: Table<WeeklyHealthRecord, string>;

    constructor() {
        super("WeeklyRecordDatabase");
        this.version(1).stores({
            weeklyHealthRecords: "id, userId, weekIdentifier, [userId+weekIdentifier]"
        });
    }
}

export class WeeklyRecordManager {
    private db: WeeklyRecordDatabase;

    constructor() {
        this.db = new WeeklyRecordDatabase();
    }

    /**
     * Aggregates an array of 1 to 7 DailyHealthRecord objects into a WeeklyHealthRecord
     */
    public aggregateWeeklyRecord(
        userId: string,
        weekIdentifier: string, // e.g. "2026-W30"
        dailyRecords: DailyHealthRecord[]
    ): WeeklyHealthRecord {
        if (dailyRecords.length === 0) {
            throw new Error("Cannot aggregate weekly record with 0 daily records.");
        }

        const sorted = [...dailyRecords].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
        const count = sorted.length;

        const totalRestingHr = sorted.reduce((sum, r) => sum + r.vitals.restingHeartRate, 0);
        const totalSpO2 = sorted.reduce((sum, r) => sum + r.vitals.spO2.average, 0);
        const totalSteps = sorted.reduce((sum, r) => sum + r.activity.totalSteps, 0);
        const totalAnomalies = sorted.reduce((sum, r) => sum + r.anomalyCount, 0);
        const totalRecoveryScore = sorted.reduce((sum, r) => sum + r.recoveryScore, 0);

        const avgRestingHeartRate = parseFloat((totalRestingHr / count).toFixed(1));
        const avgSpO2 = parseFloat((totalSpO2 / count).toFixed(1));
        const avgDailyStepCount = Math.round(totalSteps / count);
        const avgRecoveryScore = totalRecoveryScore / count;

        // Composite Health Score formula (0 to 100)
        // Deducts points for high anomalies and low recovery scores
        const anomalyPenalty = totalAnomalies * 5;
        const stepBonus = Math.min(20, (avgDailyStepCount / 10000) * 20);
        const recoveryBonus = (avgRecoveryScore / 100) * 80;

        const rawHealthScore = recoveryBonus + stepBonus - anomalyPenalty;
        const healthScore = parseFloat(Math.min(100, Math.max(0, rawHealthScore)).toFixed(1));

        return {
            id: `${userId}_WEEKLY_${weekIdentifier}`,
            userId,
            weekIdentifier,
            startDateIso: sorted[0].dateIso,
            endDateIso: sorted[sorted.length - 1].dateIso,
            avgRestingHeartRate,
            avgSpO2,
            totalStepCount: totalSteps,
            avgDailyStepCount,
            totalAnomalies,
            healthScore,
            updatedAt: Date.now()
        };
    }

    /**
     * Saves a WeeklyHealthRecord to Dexie.js IndexedDB
     */
    public async saveWeeklyRecord(record: WeeklyHealthRecord): Promise<string> {
        return await this.db.weeklyHealthRecords.put(record);
    }

    /**
     * Fetches a WeeklyHealthRecord for a given user and week identifier
     */
    public async getWeeklyRecord(userId: string, weekIdentifier: string): Promise<WeeklyHealthRecord | undefined> {
        return await this.db.weeklyHealthRecords.get(`${userId}_WEEKLY_${weekIdentifier}`);
    }

    /**
     * Clears all weekly records for a given user
     */
    public async clearUserRecords(userId: string): Promise<void> {
        const records = await this.db.weeklyHealthRecords.where("userId").equals(userId).toArray();
        const ids = records.map((r) => r.id);
        await this.db.weeklyHealthRecords.bulkDelete(ids);
    }
}
