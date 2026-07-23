/**
 * PR7.5: Health Timeline Manager Service
 * Manages chronological health events, milestones, and alerts stored in Dexie.js.
 */

import Dexie, { Table } from "dexie";
import { HealthTimelineEvent, TimelineEventType } from "../types/healthHistory";

class HealthTimelineDatabase extends Dexie {
    timelineEvents!: Table<HealthTimelineEvent, string>;

    constructor() {
        super("HealthTimelineDatabase");
        this.version(1).stores({
            timelineEvents: "id, userId, timestamp, type, severity, [userId+timestamp]"
        });
    }
}

export class HealthTimelineManager {
    private db: HealthTimelineDatabase;

    constructor() {
        this.db = new HealthTimelineDatabase();
    }

    /**
     * Records a new timeline event in IndexedDB
     */
    public async recordEvent(event: HealthTimelineEvent): Promise<string> {
        return await this.db.timelineEvents.put(event);
    }

    /**
     * Retrieves chronological timeline events for a user within a timestamp window
     */
    public async getTimeline(
        userId: string,
        startTimestamp?: number,
        endTimestamp?: number
    ): Promise<HealthTimelineEvent[]> {
        let collection = this.db.timelineEvents.where("userId").equals(userId);

        const events = await collection.toArray();
        let filtered = events;

        if (startTimestamp !== undefined) {
            filtered = filtered.filter((e) => e.timestamp >= startTimestamp);
        }
        if (endTimestamp !== undefined) {
            filtered = filtered.filter((e) => e.timestamp <= endTimestamp);
        }

        // Sort chronologically (oldest to newest)
        return filtered.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Filters timeline events by specific type (e.g. ANOMALY_ALERT)
     */
    public async getEventsByType(
        userId: string,
        eventType: TimelineEventType
    ): Promise<HealthTimelineEvent[]> {
        return await this.db.timelineEvents
            .where("userId")
            .equals(userId)
            .filter((e) => e.type === eventType)
            .toArray();
    }

    /**
     * Clears all timeline events for a specific user
     */
    public async clearUserEvents(userId: string): Promise<void> {
        const events = await this.db.timelineEvents.where("userId").equals(userId).toArray();
        const ids = events.map((e) => e.id);
        await this.db.timelineEvents.bulkDelete(ids);
    }
}
