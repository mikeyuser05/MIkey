/**
 * PR9.7: Safety and Medical Disclaimer Layer Service
 * Enforces medical safety rules, sanitizes diagnostic claims, and appends mandatory disclaimers.
 */

export interface SafetyEvaluationResult {
    sanitizedText: string;
    disclaimerAppended: boolean;
    emergencyTriggered: boolean;
    warnings: string[];
}

export class MedicalDisclaimerLayer {
    private readonly standardDisclaimer = 
        "

---" +
        "
⚠️ **Medical Disclaimer**: This AI response is for general informational purposes only and " +
        "does not constitute formal medical advice, diagnosis, or treatment planning. Always seek the advice " +
        "of a qualified healthcare provider regarding any health condition or medical concerns.";

    private readonly emergencyNotice = 
        "🚨 **EMERGENCY MEDICAL NOTICE**: " +
        "Your query indicates potential acute medical symptoms. Please contact emergency services (e.g., 911 or local emergency number) " +
        "or visit the nearest emergency department immediately. Do not rely on AI guidance for urgent medical situations.";

    private readonly restrictedPhrases = [
        "i diagnose you with",
        "you should take 500mg",
        "stop taking your medication",
        "you definitely have"
    ];

    /**
     * Inspects AI response text, sanitizes non-compliant phrases, and appends safety disclaimers
     */
    public processSafetyRules(responseText: string, isEmergency: boolean): SafetyEvaluationResult {
        const warnings: string[] = [];

        // 1. Emergency Override
        if (isEmergency) {
            return {
                sanitizedText: this.emergencyNotice,
                disclaimerAppended: true,
                emergencyTriggered: true,
                warnings: ["Emergency flag triggered. Content replaced with emergency notice."]
            };
        }

        let sanitizedText = responseText;
        const lowerText = responseText.toLowerCase();

        // 2. Scan and Sanitize Restricted Prescriptive/Diagnostic Claims
        for (const phrase of this.restrictedPhrases) {
            if (lowerText.includes(phrase)) {
                warnings.push(`Detected restricted clinical phrase: "${phrase}"`);
                // Replace definitive claims with non-diagnostic wording
                const regex = new RegExp(phrase, "gi");
                sanitizedText = sanitizedText.replace(regex, "[Consult a physician for diagnostic advice regarding]");
            }
        }

        // 3. Append Standard Disclaimer if not already present
        let disclaimerAppended = false;
        if (!sanitizedText.includes("Medical Disclaimer")) {
            sanitizedText += this.standardDisclaimer;
            disclaimerAppended = true;
        }

        return {
            sanitizedText,
            disclaimerAppended,
            emergencyTriggered: false,
            warnings
        };
    }
}
