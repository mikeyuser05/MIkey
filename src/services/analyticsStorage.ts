/**
 * PR6.1: Offline-First Analytics Storage Service (IndexedDB / Dexie)
 * Manages local caching of analytical summaries without duplicating live telemetry sources of truth.
 */

import Dexie, { Table } from "dexie";
import { AnalyticsRecord, TimeBucket } from "../types/analytics";

export class HealthAnalyticsDatabase extends Dexie {
    public analyticsRecords!: Table<AnalyticsRecord, string>;

    constructor() {
        super("NOEXCUSE_HealthAnalyticsDB");
        this.version(1).stores({
            analyticsRecords: "id, userId, bucketType, windowStartIso, [userId+bucketType]"
        });
    }
}

export const analyticsDb = new HealthAnalyticsDatabase();

export class AnalyticsStorageService {
    /**
     * Persists or updates an aggregated analytics record locally
     */
    public async saveRecord(record: AnalyticsRecord): Promise<string> {
        return await analyticsDb.analyticsRecords.put(record);
    }

    /**
     * Retrieves analytics records for a given user and bucket timeframe
     */
    public async getRecords(userId: string, bucketType: TimeBucket): Promise<AnalyticsRecord[]> {
        return await analyticsDb.analyticsRecords
            .where("[userId+bucketType]")
            .equals([userId, bucketType])
            .sortBy("windowStartIso");
    }

    /**
     * Gets a specific analytics record by composite ID
     */
    public async getRecordById(id: string): Promise<AnalyticsRecord | undefined> {
        return await analyticsDb.analyticsRecords.get(id);
    }

    /**
     * Clears cached analytics records (e.g. on user logout or privacy clear)
     */
    public async clearUserAnalytics(userId: string): Promise<number> {
        const records = await analyticsDb.analyticsRecords
            .where("userId")
            .equals(userId)
            .toArray();
        const ids = records.map((r) => r.id);
        await analyticsDb.analyticsRecords.bulkDelete(ids);
        return ids.length;
    }
}
