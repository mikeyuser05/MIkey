/**
 * PR9: Master Test Runner for Phase 9 (Multi-Turn Conversation & QA Engine)
 * Runs test suites PR9.1 through PR9.8 in sequence.
 */

import { runPR91Tests } from "./test_pr9_1";
import { runPR92Tests } from "./test_pr9_2";
import { runPR93Tests } from "./test_pr9_3";
import { runPR94Tests } from "./test_pr9_4";
import { runPR95Tests } from "./test_pr9_5";
import { runPR96Tests } from "./test_pr9_6";
import { runPR97Tests } from "./test_pr9_7";
import { runPR98Tests } from "./test_pr9_8";

async function runAllPhase9Tests() {
    console.log("================================================================");
    console.log("🚀 STARTING FULL VERIFICATION SUITE FOR PHASE 9 MODULES");
    console.log("================================================================\n");

    const suiteResults: { suite: string; passed: boolean }[] = [];

    suiteResults.push({ suite: "PR9.1 Conversation Types & Schemas", passed: await runPR91Tests() });
    suiteResults.push({ suite: "PR9.2 Health Query Intent Analyzer", passed: await runPR92Tests() });
    suiteResults.push({ suite: "PR9.3 Structured Context Retriever", passed: await runPR93Tests() });
    suiteResults.push({ suite: "PR9.4 Semantic Retrieval Readiness", passed: await runPR94Tests() });
    suiteResults.push({ suite: "PR9.5 AI Conversation Pipeline", passed: await runPR95Tests() });
    suiteResults.push({ suite: "PR9.6 Conversation History & Memory", passed: await runPR96Tests() });
    suiteResults.push({ suite: "PR9.7 Safety & Medical Disclaimer Layer", passed: await runPR97Tests() });
    suiteResults.push({ suite: "PR9.8 End-to-End Chat & QA Integration", passed: await runPR98Tests() });

    console.log("================================================================");
    console.log("  PHASE 9 TEST SUITE SUMMARY RESULTS");
    console.log("================================================================");

    let allPassed = true;
    for (const result of suiteResults) {
        const icon = result.passed ? "✅ PASS" : "❌ FAIL";
        console.log(`${icon} | ${result.suite}`);
        if (!result.passed) allPassed = false;
    }

    console.log("----------------------------------------------------------------");
    if (allPassed) {
        console.log("🎉 ALL PHASE 9 UNITS & INTEGRATION SUITES PASSED SUCCESSFULLY!");
    } else {
        console.error("⚠️ ONE OR MORE TEST SUITES FAILED. REVIEW LOGS ABOVE.");
        process.exit(1);
    }
}

if (require.main === module) {
    runAllPhase9Tests();
}
