import os

files = {
    "src/services/aiConversationPipeline.ts": '''/**
 * AI Conversation Pipeline Service
 * Manages medical Q&A streams, context integration, and safety disclaimers.
 */

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class AIConversationPipeline {
  private history: ConversationMessage[] = [];

  public async sendMessage(prompt: string): Promise<string> {
    const userMsg: ConversationMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    this.history.push(userMsg);

    // Mock processing / pipeline logic
    let responseText = `Received telemetry context and prompt: "${prompt}". All vitals within nominal bounds.`;
    responseText += '\\n\\nDISCLAIMER: For informational purposes only. Consult a physician for diagnostic advice.';

    const assistantMsg: ConversationMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
    };
    this.history.push(assistantMsg);

    return responseText;
  }

  public getHistory(): ConversationMessage[] {
    return this.history;
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export const aiConversationPipeline = new AIConversationPipeline();
''',

    "src/services/medicalDisclaimerLayer.ts": '''/**
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
    "\\n\\n---\\n" +
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
      formattedText = `${this.emergencyNotice}\\n\\n${formattedText}`;
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
'''
}

def build():
    for filepath, content in files.items():
        dirpath = os.path.dirname(filepath)
        if dirpath:
            os.makedirs(dirpath, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated/Created: {filepath}")

    print("\n==============================================")
    print("--- AI SERVICES STRING SYNTAX FIXED ---")
    print("==============================================\n")

if __name__ == "__main__":
    build()