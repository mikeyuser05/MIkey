/**
 * PR10.8: Production Platform Validation Test Suite
 * Validates all Phase 10 platform architecture modules (PR10.1 through PR10.7).
 */

import { LongTermHealthModelService } from "../services/longTermHealthModel";
import { AdvancedPersonalizationEngine } from "../services/advancedPersonalizationEngine";
import { MultiDeviceSyncManager } from "../services/multiDeviceSyncManager";
import { SecureSharingController } from "../services/secureSharingController";
import { LocalAIReadinessEngine } from "../services/localAIReadinessEngine";
import { MobileOfflineEngine } from "../services/mobileOfflineEngine";
import { DailyHealthRecord } from "../types/healthHistory";

export async function runPhase10Validation(): Promise<boolean> {
    console.log("================================================================");
    console.log("🚀 STARTING FULL VERIFICATION SUITE FOR PHASE 10 PLATFORM");
    console.log("================================================================\n");

    try {
        // 1. Long-Term Health Model (PR10.2)
        console.log("[TEST 1] Verifying PR10.2 Long-Term Personal Health Model...");
        const ltService = new LongTermHealthModelService();
        const dummyRecords: DailyHealthRecord[] = [
            {
                id: "REC_10_1",
                userId: "USR_10",
                dateIso: "2026-07-23",
                vitals: { heartRate: { min: 55, max: 110, average: 68 }, spO2: { min: 97, max: 99, average: 98 }, restingHeartRate: 62 },
                activity: { totalSteps: 9500, activeMinutes: 40, estimatedCaloriesBurned: 450 },
                anomalyCount: 0,
                stressScore: 0.12,
                recoveryScore: 88,
                dataQualityRatio: 1.0,
                updatedAt: Date.now()
            },
            {
                id: "REC_10_2",
                userId: "USR_10",
                dateIso: "2026-07-24",
                vitals: { heartRate: { min: 58, max: 115, average: 70 }, spO2: { min: 96, max: 99, average: 98 }, restingHeartRate: 64 },
                activity: { totalSteps: 10200, activeMinutes: 45, estimatedCaloriesBurned: 490 },
                anomalyCount: 0,
                stressScore: 0.15,
                recoveryScore: 85,
                dataQualityRatio: 1.0,
                updatedAt: Date.now()
            }
        ];

        const profile = ltService.buildProfile("USR_10", dummyRecords);
        console.log(`  ✓ 30-Day Resting HR Mean: ${profile.baseline30D.restingHeartRateMean} BPM`);
        console.log(`  ✓ Macro Trends Detected: ${profile.macroTrends.length}`);
        if (profile.baseline30D.restingHeartRateMean !== 63) throw new Error("LongTermHealthModel calculation mismatch.");

        // 2. Advanced Personalization (PR10.3)
        console.log("\n[TEST 2] Verifying PR10.3 Advanced Personalization Engine...");
        const personalizationEngine = new AdvancedPersonalizationEngine();
        const insights = personalizationEngine.generateInsights(profile, {
            preferredTone: "DIRECT",
            activityGoalFlexibility: "ADAPTIVE",
            notificationUrgencyThreshold: "MEDIUM"
        });
        console.log(`  ✓ Generated Insights Count: ${insights.length}`);
        console.log(`  ✓ Primary Insight Headline: "${insights[0]?.headline}"`);
        if (insights.length < 2) throw new Error("Personalization engine output count mismatch.");

        // 3. Multi-Device Architecture (PR10.4)
        console.log("\n[TEST 3] Verifying PR10.4 Multi-Device Sync Architecture...");
        const syncManager = new MultiDeviceSyncManager();
        syncManager.registerDevice({ deviceId: "ESP32_NODE_01", deviceType: "ESP32_WEARABLE", lastSyncTimestamp: Date.now(), firmwareVersion: "v2.1.0", isOnline: true });
        syncManager.registerDevice({ deviceId: "WEB_DASHBOARD_01", deviceType: "WEB_DASHBOARD", lastSyncTimestamp: Date.now(), firmwareVersion: "v1.0.0", isOnline: true });

        const syncResult = syncManager.executeSync("ESP32_NODE_01", "WEB_DASHBOARD_01", 25);
        console.log(`  ✓ Sync Status: ${syncResult.status}`);
        console.log(`  ✓ Records Transferred: ${syncResult.recordsTransferred}`);
        if (syncResult.status !== "SUCCESS" || syncResult.recordsTransferred !== 25) throw new Error("MultiDeviceSync failed.");

        // 4. Secure Data Sharing (PR10.5)
        console.log("\n[TEST 4] Verifying PR10.5 Secure Data Sharing & Consent System...");
        const shareController = new SecureSharingController();
        const grant = shareController.createGrant("USR_10", "CLINICIAN_DOC_42", {
            shareVitals: true,
            shareActivity: false,
            shareAnomalies: true,
            shareFullHistory: false
        }, 24);

        const canAccessVitals = shareController.validateAccess(grant.grantId, "shareVitals");
        const canAccessActivity = shareController.validateAccess(grant.grantId, "shareActivity");
        console.log(`  ✓ Vitals Access Granted: ${canAccessVitals}`);
        console.log(`  ✓ Activity Access Blocked (per scope): ${!canAccessActivity}`);
        if (!canAccessVitals || canAccessActivity) throw new Error("SecureSharing authorization validation failed.");

        // 5. Local AI Readiness (PR10.6)
        console.log("\n[TEST 5] Verifying PR10.6 Local AI & Offline Heuristics Engine...");
        const localAI = new LocalAIReadinessEngine();
        const evalNormal = localAI.executeLocalInference({ heartRate: 72, spO2: 98 });
        const evalEmergency = localAI.executeLocalInference({ heartRate: 160, spO2: 88 });

        console.log(`  ✓ Normal Vitals Local Response: "${evalNormal.assessment}"`);
        console.log(`  ✓ Emergency Flagged Locally: ${evalEmergency.isEmergency}`);
        if (!evalEmergency.isEmergency || evalNormal.isEmergency) throw new Error("Local AI rule evaluation failed.");

        // 6. Mobile & Offline Operations Engine (PR10.7)
        console.log("\n[TEST 6] Verifying PR10.7 Mobile & Offline Queue Replay Engine...");
        const offlineEngine = new MobileOfflineEngine();
        offlineEngine.enqueueAction("RECORD_VITALS", { heartRate: 75, spO2: 99 });
        offlineEngine.enqueueAction("LOG_EVENT", { eventType: "WORKOUT_COMPLETE" });

        console.log(`  ✓ Initial Queued Actions: ${offlineEngine.getQueueLength()}`);
        const flushResult = offlineEngine.flushAndReplayQueue((act) => true);
        console.log(`  ✓ Replayed Actions: ${flushResult.replayed}`);
        console.log(`  ✓ Remaining Queue Length: ${offlineEngine.getQueueLength()}`);

        if (flushResult.replayed !== 2 || offlineEngine.getQueueLength() !== 0) throw new Error("Mobile offline queue replay failed.");

        console.log("\n================================================================");
        console.log("🎉 ALL PHASE 10 PLATFORM ARCHITECTURE MODULES PASSED VALIDATION!");
        console.log("================================================================\n");
        return true;

    } catch (err) {
        console.error("\n❌ PHASE 10 VALIDATION FAILED:", err);
        return false;
    }
}

if (require.main === module) {
    runPhase10Validation();
}
