/**
 * PR6.8: Master Pipeline Test Suite Execution
 * Runs all PR6 module verification tests sequentially.
 */

import { runPR61Tests } from "./test_pr6_1";
import { runPR62Tests } from "./test_pr6_2";
import { runPR63Tests } from "./test_pr6_3";
import { runPR64Tests } from "./test_pr6_4";
import { runPR65Tests } from "./test_pr6_5";
import { runPR66Tests } from "./test_pr6_6";
import { runPR67Tests } from "./test_pr6_7";

export async function runAllPR6Tests(): Promise<boolean> {
    console.log("==================================================================");
    console.log("  STARTING PR6 MASTER INTEGRATION TEST SUITE (PR6.1 -> PR6.7)     ");
    console.log("==================================================================
");

    const results = {
        pr6_1: await runPR61Tests(),
        pr6_2: await runPR62Tests(),
        pr6_3: await runPR63Tests(),
        pr6_4: await runPR64Tests(),
        pr6_5: await runPR65Tests(),
        pr6_6: await runPR66Tests(),
        pr6_7: await runPR67Tests()
    };

    console.log("==================================================================");
    console.log("  PR6 MASTER TEST RESULTS SUMMARY                                 ");
    console.log("==================================================================");
    console.log(`  PR6.1 Contextual Baseline Engine : ${results.pr6_1 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.2 Daily Analytics Rollup     : ${results.pr6_2 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.3 Multi-Period Aggregation   : ${results.pr6_3 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.4 Trend Engine               : ${results.pr6_4 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.5 Stability & Recovery       : ${results.pr6_5 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.6 Anomaly Scoring            : ${results.pr6_6 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log(`  PR6.7 Analytics Export Engine    : ${results.pr6_7 ? "PASSED ✅" : "FAILED ❌"}`);
    console.log("==================================================================
");

    const allPassed = Object.values(results).every((res) => res === true);
    if (allPassed) {
        // fixed test output log
    } else {
        console.error("❌ ONE OR MORE PR6 SUBMODULE TESTS FAILED.");
    }

    return allPassed;
}

if (require.main === module) {
    runAllPR6Tests();
}
