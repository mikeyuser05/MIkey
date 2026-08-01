/**
 * PR9.7: Safety and Medical Disclaimer Layer Verification Test
 */

import { MedicalDisclaimerLayer } from "../services/medicalDisclaimerLayer";

export async function runPR97Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.7 SAFETY & MEDICAL DISCLAIMER TESTS ");
    console.log("==================================================");

    const safetyLayer = new MedicalDisclaimerLayer();

    try {
        console.log("[TEST 1] Testing Standard Response Disclaimer Appending...");
        const res1 = safetyLayer.processSafetyRules("Your heart rate trend appears consistent with normal rest.", false);

        console.log(`  ✓ Disclaimer Appended: ${res1.disclaimerAppended}`);
        console.log(`  ✓ Output Contains Disclaimer Text: ${res1.sanitizedText.includes("Medical Disclaimer")}`);

        if (!res1.disclaimerAppended || !res1.sanitizedText.includes("Medical Disclaimer")) {
            throw new Error("Standard medical disclaimer injection failed.");
        }

        console.log("[TEST 2] Testing Restricted Diagnostic Wording Sanitization...");
        const res2 = safetyLayer.processSafetyRules("Based on your vitals, I diagnose you with hypertension.", false);

        console.log(`  ✓ Warning Flagged Count: ${res2.warnings.length}`);
        console.log(`  ✓ Warning Content: "${res2.warnings[0]}"`);
        console.log(`  ✓ Sanitized Snippet: "${res2.sanitizedText.substring(0, 80)}..."`);

        if (res2.warnings.length === 0 || res2.sanitizedText.includes("I diagnose you with")) {
            throw new Error("Restricted phrase sanitization failed.");
        }

        console.log("[TEST 3] Testing Emergency Response Override...");
        const res3 = safetyLayer.processSafetyRules("User reporting severe chest pressure.", true);

        console.log(`  ✓ Emergency Triggered Flag: ${res3.emergencyTriggered}`);
        console.log(`  ✓ Output Contains Emergency Notice: ${res3.sanitizedText.includes("EMERGENCY MEDICAL NOTICE")}`);

        if (!res3.emergencyTriggered || !res3.sanitizedText.includes("EMERGENCY MEDICAL NOTICE")) {
            throw new Error("Emergency override handling failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR9.7 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR97Tests();
}
