/**
 * PR8.8: Integration and Validation Test Suite Runner
 * Runs verification across all PR8 sub-modules.
 */

import { runPR81Tests } from "./test_pr8_1";
import { runPR82Tests } from "./test_pr8_2";
import { runPR83Tests } from "./test_pr8_3";
import { runPR84Tests } from "./test_pr8_4";
import { runPR85Tests } from "./test_pr8_5";
import { runPR86Tests } from "./test_pr8_6";
import { runPR87Tests } from "./test_pr8_7";
import { AIHealthOrchestrator } from "../services/aiOrchestrator";
import { DailyHealthRecord } from "../types/healthHistory";
import { UserHealthBaseline } from "../types/aiContext";

export async function runFullPR8TestSuite(): Promise<boolean> {
    console.log("==================================================");
    console.log("🚀 STARTING PR8 MASTER INTEGRATION & TEST SUITE   ");
    console.log("==================================================
");

    const suiteResults = [
        await runPR81Tests(),
        await runPR82Tests(),
        await runPR83Tests(),
        await runPR84Tests(),
        await runPR85Tests(),
        await runPR86Tests(),
        await runPR87Tests()
    ];

    console.log("--------------------------------------------------");
    console.log("[FINAL TEST] Testing AIHealthOrchestrator End-to-End...");
    
    const orchestrator = new AIHealthOrchestrator();
    const baseline: UserHealthBaseline = {
        avgRestingHeartRate: 60,
        avgSpO2: 99.0,
        dailyStepGoal: 10000,
        typicalActiveMinutes: 60
    };

    const mockRecord: DailyHealthRecord = {
        id: "REC_2026-07-24",
        userId: "USER_INTEGRATION_TEST",
        dateIso: "2026-07-24",
        vitals: {
            heartRate: { min: 55, max: 120, average: 70 },
            spO2: { min: 97, max: 100, average: 99.0 },
            restingHeartRate: 60.0
        },
        activity: { totalSteps: 10500, activeMinutes: 65, estimatedCaloriesBurned: 520 },
        anomalyCount: 0,
        stressScore: 0.10,
        recoveryScore: 92.0,
        dataQualityRatio: 1.0,
        updatedAt: Date.now()
    };

    try {
        const finalInterpretation = await orchestrator.processHealthInterpretation(
            "USER_INTEGRATION_TEST",
            baseline,
            [mockRecord],
            [],
            "Analyze my daily health record summary."
        );

        console.log("  ✓ Master Orchestrator execution successful.");
        console.log(`    - ID: ${finalInterpretation.interpretationId}`);
        console.log(`    - Disclaimer Enforced: ${finalInterpretation.disclaimer.length > 0}`);
        
        const allPassed = suiteResults.every((res) => res === true);

        if (allPassed) {
            // fixed test output log
            return true;
        } else {
            console.error("
❌ ONE OR MORE PR8 SUB-MODULE TESTS FAILED.");
            return false;
        }
    } catch (e) {
        console.error("❌ Orchestrator test failed:", e);
        return false;
    }
}

if (require.main === module) {
    runFullPR8TestSuite();
}
