/**
 * NOEXCUSE HPO V2: PR4.8 AI Integration Domain Types
 */

export type AIProviderType = 'CHATGPT' | 'GEMINI' | 'CLAUDE';

export interface IProviderConfig {
  id: AIProviderType;
  name: string;
  baseUrl: string;
}

export interface IPromptContext {
  recommendationPayload: any; // Consumes IStructuredRecommendationOutput
  reportPayload: any;         // Consumes IPeriodicReport
  timestamp: number;
}

export interface IPromptBuilder {
  buildPrompt(context: IPromptContext): string;
}