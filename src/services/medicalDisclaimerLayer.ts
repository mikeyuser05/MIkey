/**
 * Medical Disclaimer Layer Service
 * Validates responses for safety disclaimers and emergency notices.
 */

export interface SafetyEvaluationResult {
  isSafe: boolean;
  containsDisclaimer: boolean;
  isEmergencyTriggered: boolean;
  formattedText: string;
}

export class MedicalDisclaimerLayer {
  private readonly defaultDisclaimer = 
    "\n\n---\n" +
    "⚠️ **Medical Disclaimer**: This AI response is for general informational purposes only and does not constitute medical diagnosis or advice.";

  private readonly emergencyNotice = 
    "🚨 **EMERGENCY WARNING**: High risk detected in biometric stream. Contact emergency services immediately.";

  private readonly restrictedPhrases = [
    "diagnose",
    "prescribe",
    "cure"
  ];

  public processSafetyRules(responseText: string, isEmergency: boolean): SafetyEvaluationResult {
    let formattedText = responseText;
    let containsDisclaimer = responseText.includes("Medical Disclaimer");

    if (!containsDisclaimer) {
      formattedText += this.defaultDisclaimer;
      containsDisclaimer = true;
    }

    if (isEmergency) {
      formattedText = `${this.emergencyNotice}\n\n${formattedText}`;
    }

    return {
      isSafe: true,
      containsDisclaimer,
      isEmergencyTriggered: isEmergency,
      formattedText
    };
  }
}

export const medicalDisclaimerLayer = new MedicalDisclaimerLayer();
