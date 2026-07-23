/**
 * PR7.4: Monthly Health Record Manager Service
 * Aggregates DailyHealthRecord snapshots into MonthlyHealthRecord summaries stored in Dexie.js.
 */

import Dexie, { Table } from "dexie";
import { DailyHealthRecord, MonthlyHealthRecord } from "../types/healthHistory";

class MonthlyRecordDatabase extends Dexie {
    monthlyHealthRecords!: Table<MonthlyHealthRecord, string>;

    constructor() {
        super("MonthlyRecordDatabase");
        this.version(1).stores({
            monthlyHealthRecords: "id, userId, monthIdentifier, [userId+monthIdentifier]"
        });
    }
}

export class MonthlyRecordManager {
    private db: MonthlyRecordDatabase;

    constructor() {
        this.db = new MonthlyRecordDatabase();
    }

    /**
     * Aggregates daily records for a full calendar month into a MonthlyHealthRecord
     */
    public aggregateMonthlyRecord(
        userId: string,
        monthIdentifier: string, // e.g. "2026-07"
        dailyRecords: DailyHealthRecord[]
    ): MonthlyHealthRecord {
        if (dailyRecords.length === 0) {
            throw new Error("Cannot aggregate monthly record with 0 daily records.");
        }

        const sorted = [...dailyRecords].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
        const count = sorted.length;

        const totalRestingHr = sorted.reduce((sum, r) => sum + r.vitals.restingHeartRate, 0);
        const totalSpO2 = sorted.reduce((sum, r) => sum + r.vitals.spO2.average, 0);
        const totalSteps = sorted.reduce((sum, r) => sum + r.activity.totalSteps, 0);
        const totalAnomalies = sorted.reduce((sum, r) => sum + r.anomalyCount, 0);

        const avgRestingHeartRate = parseFloat((totalRestingHr / count).toFixed(1));
        const avgSpO2 = parseFloat((totalSpO2 / count).toFixed(1));
        const avgDailySteps = totalSteps / count;

        let dominantContext = "RESTING";
        if (avgDailySteps >= 10000) {
            dominantContext = "HIGH_INTENSITY";
        } else if (avgDailySteps >= 6000) {
            dominantContext = "MODERATE_ACTIVITY";
        }

        return {
            id: `${userId}_MONTHLY_${monthIdentifier}`,
            userId,
            monthIdentifier,
            startDateIso: sorted[0].dateIso,
            endDateIso: sorted[sorted.length - 1].dateIso,
            avgRestingHeartRate,
            avgSpO2,
            totalStepCount: totalSteps,
            totalAnomalies,
            dominantContext,
            updatedAt: Date.now()
        };
    }

    /**
     * Saves a MonthlyHealthRecord to Dexie.js IndexedDB
     */
    public async saveMonthlyRecord(record: MonthlyHealthRecord): Promise<string> {
        return await this.db.monthlyHealthRecords.put(record);
    }

    /**
     * Fetches a MonthlyHealthRecord for a given user and month identifier
     */
    public async getMonthlyRecord(userId: string, monthIdentifier: string): Promise<MonthlyHealthRecord | undefined> {
        return await this.db.monthlyHealthRecords.get(`${userId}_MONTHLY_${monthIdentifier}`);
    }

    /**
     * Clears all monthly records for a given user
     */
    public async clearUserRecords(userId: string): Promise<void> {
        const records = await this.db.monthlyHealthRecords.where("userId").equals(userId).toArray();
        const ids = records.map((r) => r.id);
        await this.db.monthlyHealthRecords.bulkDelete(ids);
    }
}
