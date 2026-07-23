/**
 * PR7.7: Privacy Export Service Verification & Unit Tests
 */

import { PrivacyExportService } from "../services/privacyExport";
import { DailyHealthRecord, PrivacyExportConfig } from "../types/healthHistory";
import { DailyRecordManager } from "../services/dailyRecordManager";

export async function runPR77Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR7.7 PRIVACY EXPORT & CONTROLS TESTS   ");
    console.log("==================================================");

    const privacyService = new PrivacyExportService();
    const dailyManager = new DailyRecordManager();
    const testUserId = "TEST_USER_PR7_7";

    const mockRecord: DailyHealthRecord = {
        id: `${testUserId}_DAILY_2026-07-24`,
        userId: testUserId,
        dateIso: "2026-07-24",
        vitals: {
            heartRate: { min: 58, max: 140, average: 73 },
            spO2: { min: 96, max: 99, average: 98.1 },
            restingHeartRate: 60
        },
        activity: {
            totalSteps: 10200,
            activeMinutes: 50,
            estimatedCaloriesBurned: 510
        },
        anomalyCount: 0,
        stressScore: 0.15,
        recoveryScore: 88.0,
        dataQualityRatio: 0.99,
        updatedAt: Date.now()
    };

    try {
        console.log("[TEST 1] Testing Anonymized & Vitals-Only Export Config...");
        const privacyConfig: PrivacyExportConfig = {
            userId: testUserId,
            includeVitals: true,
            includeActivity: false,
            includeAnomalies: false,
            anonymizeUserId: true
        };

        const sanitized = privacyService.sanitizeDailyRecords([mockRecord], privacyConfig);

        console.log("  ✓ Sanitization complete.");
        console.log(`    - Anonymized User ID: ${sanitized[0].userId}`);
        console.log(`    - Vitals Present: ${sanitized[0].vitals !== undefined ? "YES" : "NO"}`);
        console.log(`    - Activity Omitted: ${sanitized[0].activity === undefined ? "YES" : "NO"}`);

        if (sanitized[0].userId !== "ANONYMOUS_USER" || sanitized[0].activity !== undefined) {
            throw new Error("Sanitization policy enforcement failed.");
        }

        console.log("[TEST 2] Testing CSV Formatting for Sanitized Output...");
        const csv = privacyService.exportToCsv(sanitized);

        console.log("  ✓ CSV generated successfully.");
        console.log(`    - CSV Header: ${csv.split("\n")[0]}`);

        if (!csv.includes("hr_avg") || csv.includes("totalSteps")) {
            throw new Error("CSV structure failed to respect masked fields.");
        }

        console.log("[TEST 3] Testing Multi-Table User Data Purge...");
        await dailyManager.saveDailyRecord(mockRecord);
        let beforePurge = await dailyManager.getDailyRecord(testUserId, "2026-07-24");
        if (!beforePurge) throw new Error("Failed to store pre-purge test record.");

        await privacyService.purgeAllUserData(testUserId);
        let afterPurge = await dailyManager.getDailyRecord(testUserId, "2026-07-24");

        if (afterPurge !== undefined) {
            throw new Error("Data purge failed to clear IndexedDB tables.");
        }
        console.log("  ✓ User data purge successfully verified.");

        console.log("
✅ ALL PR7.7 PRIVACY EXPORT TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR7.7 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR77Tests();
}
