import { IProviderConfig } from '../types/aiIntegration';

export const AI_PROVIDERS: Record<string, IProviderConfig> = {
  CHATGPT: {
    id: 'CHATGPT',
    name: 'ChatGPT',
    baseUrl: 'https://chat.openai.com'
  },
  GEMINI: {
    id: 'GEMINI',
    name: 'Google Gemini',
    baseUrl: 'https://gemini.google.com'
  },
  CLAUDE: {
    id: 'CLAUDE',
    name: 'Claude',
    baseUrl: 'https://claude.ai'
  }
};