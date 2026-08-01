/**
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
    responseText += '\n\nDISCLAIMER: For informational purposes only. Consult a physician for diagnostic advice.';

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
