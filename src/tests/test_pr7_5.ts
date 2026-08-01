/**
 * PR7.5: Health Timeline Manager Verification & Unit Tests
 */

import { HealthTimelineManager } from "../services/healthTimeline";
import { HealthTimelineEvent } from "../types/healthHistory";

export async function runPR75Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.5 HEALTH TIMELINE MANAGER TESTS    ");
    console.log("==================================================");

    const manager = new HealthTimelineManager();
    const testUserId = "TEST_USER_PR7_5";
    const baseTime = Date.now();

    const mockEvents: HealthTimelineEvent[] = [
        {
            id: "EVT_1",
            userId: testUserId,
            timestamp: baseTime - 3600000 * 3, // 3 hours ago
            type: "WORKOUT_SESSION",
            severity: "LOW",
            title: "Morning Run Completed",
            description: "Recorded 45 minutes of active cardio.",
            metadata: { avgHr: 142, peakHr: 168 }
        },
        {
            id: "EVT_2",
            userId: testUserId,
            timestamp: baseTime - 3600000 * 2, // 2 hours ago
            type: "RECOVERY_MILESTONE",
            severity: "LOW",
            title: "Optimal Recovery Rate",
            description: "Post-workout heart rate drop exceeded 25 BPM/min.",
            metadata: { dropRate: 26.5 }
        },
        {
            id: "EVT_3",
            userId: testUserId,
            timestamp: baseTime - 3600000 * 1, // 1 hour ago
            type: "ANOMALY_ALERT",
            severity: "HIGH",
            title: "Elevated Resting HR Spike",
            description: "Spike detected during resting state (+18 BPM over baseline).",
            metadata: { restingHr: 82 }
        }
    ];

    try {
        console.log("[TEST 1] Recording Timeline Events...");
        for (const evt of mockEvents) {
            await manager.recordEvent(evt);
        }
        console.log(`  ✓ Successfully recorded ${mockEvents.length} events.`);

        console.log("[TEST 2] Retrieving Chronological Timeline...");
        const timeline = await manager.getTimeline(testUserId);

        console.log("  ✓ Timeline retrieved.");
        console.log(`    - Total Events: ${timeline.length}`);
        console.log(`    - First Event Title: "${timeline[0].title}"`);
        console.log(`    - Last Event Title: "${timeline[timeline.length - 1].title}"`);

        if (timeline.length !== 3 || timeline[0].id !== "EVT_1" || timeline[2].id !== "EVT_3") {
            throw new Error("Chronological ordering or count validation failed.");
        }

        console.log("[TEST 3] Filtering Events by Type (ANOMALY_ALERT)...");
        const anomalyEvents = await manager.getEventsByType(testUserId, "ANOMALY_ALERT");

        console.log("  ✓ Event filtering complete.");
        console.log(`    - Found ${anomalyEvents.length} ANOMALY_ALERT event(s).`);

        if (anomalyEvents.length !== 1 || anomalyEvents[0].severity !== "HIGH") {
            throw new Error("Type filtering or property verification failed.");
        }

        console.log("[TEST 4] Cleaning up timeline records...");
        await manager.clearUserEvents(testUserId);

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR7.5 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR75Tests();
}
