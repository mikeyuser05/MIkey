/**
 * PR9.2: Health Query Understanding Verification Test
 */

import { HealthQueryAnalyzer } from "../services/healthQueryAnalyzer";

export async function runPR92Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.2 HEALTH QUERY UNDERSTANDING TESTS  ");
    console.log("==================================================");

    const analyzer = new HealthQueryAnalyzer();

    try {
        console.log("[TEST 1] Analyzing Vital Trend Query...");
        const res1 = analyzer.analyzeQuery("Why was my heart rate and resting heart rate higher today?");
        
        console.log(`  ✓ Intent Detected: ${res1.intent}`);
        console.log(`    - Metrics Extracted: [${res1.entities.metricTypes.join(", ")}]`);
        console.log(`    - Timeframes Extracted: [${res1.entities.timeframeKeywords.join(", ")}]`);

        if (res1.intent !== "VITAL_TREND_ANALYSIS" || res1.entities.metricTypes.length < 2) {
            throw new Error("Vital trend intent classification failed.");
        }

        console.log("[TEST 2] Analyzing Emergency Escalation Query...");
        const res2 = analyzer.analyzeQuery("I am having sudden chest pain and shortness of breath!");

        console.log(`  ✓ Intent Detected: ${res2.intent}`);
        console.log(`    - Is Emergency Flagged: ${res2.entities.isEmergency}`);
        console.log(`    - Emergency Symptoms Extracted: [${res2.entities.symptoms.join(", ")}]`);

        if (res2.intent !== "EMERGENCY_ESCALATION" || !res2.entities.isEmergency) {
            throw new Error("Emergency escalation query detection failed.");
        }

        console.log("
✅ ALL PR9.2 HEALTH QUERY UNDERSTANDING TESTS PASSED SUCCESSFULLY.
");
        return true;
    } catch (error) {
        console.error("❌ PR9.2 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR92Tests();
}
