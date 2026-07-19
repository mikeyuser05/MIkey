import { PromptBuilder } from '../engine/promptBuilder';
import { ContextBuilder } from '../engine/contextBuilder';
import { ProviderRegistry } from '../engine/providerRegistry';
import { ClientInteractionService, IClipboardNavigator, IWindowLauncher, INotificationChannel } from '../engine/clientInteractionService';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.8 AI Integration Layer - Automated Verification Suite', () => {
  
  // High-fidelity mocking state payloads representing historical parameters from PR4.4 and PR4.7
  const mockRecommendation = {
    primaryActionCode: 'REC_MAX_RECOVERY',
    recommendations: [
      { priority: 'HIGH', actionItem: 'Hydration Adjustment', rationale: 'Compensate for elevated ambient gas metrics.' }
    ]
  };

  const mockReport = {
    type: 'WEEKLY',
    dataPointsEvaluated: 7,
    criticalAlertCount: 2,
    metrics: {
      heartRate: { min: 60, max: 140, average: 82 },
      spo2: { min: 94, max: 99, average: 97 },
      gas: { min: 120, max: 450, average: 210 }
    },
    healthScores: {
      cardiovascularScore: 90,
      respiratoryScore: 96,
      environmentalSafetyScore: 88,
      overallHealthScore: 91
    },
    primaryRiskDirectives: ['MONITOR_RESPIRATORY_BASELINE_STABILITY']
  };

  test('ContextBuilder: Encapsulates incoming payload frameworks flawlessly and applies current timestamps', () => {
    const context = ContextBuilder.assembleContext(mockRecommendation, mockReport, 1710000000000);
    
    expect(context.timestamp).toBe(1710000000000);
    expect(context.recommendationPayload.primaryActionCode).toBe('REC_MAX_RECOVERY');
    expect(context.reportPayload.healthScores.overallHealthScore).toBe(91);
  });

  test('PromptBuilder: Renders a structured, deterministic markdown document matching target patterns', () => {
    const context = ContextBuilder.assembleContext(mockRecommendation, mockReport, 1710000000000);
    const builder = new PromptBuilder();
    const resultPrompt = builder.buildPrompt(context);

    expect(resultPrompt).toContain('[SYSTEM INSTRUCTION: ANALYZE HEALTH INSIGHTS PAYLOAD]');
    expect(resultPrompt).toContain('Primary Action Trigger Code: REC_MAX_RECOVERY');
    expect(resultPrompt).toContain('Overall Composite Health Score: 91/100');
    expect(resultPrompt).toContain('Heart Rate: Min 60 bpm | Max 140 bpm | Avg 82 bpm');
  });

  test('ProviderRegistry: Resolves correct base deep link targets across defined vendor spaces', () => {
    const registry = new ProviderRegistry();
    
    expect(registry.getLaunchUrl('CHATGPT')).toBe('https://chat.openai.com');
    expect(registry.getLaunchUrl('GEMINI')).toBe('https://gemini.google.com');
    expect(registry.getLaunchUrl('CLAUDE')).toBe('https://claude.ai');
    expect(registry.getRegisteredProviders().length).toBe(3);
  });

  test('ClientInteractionService: Completes copy-and-launch mechanics isolated from actual DOM constraints', async () => {
    const registry = new ProviderRegistry();
    
    // Virtual mock interfaces capturing outbound device calls
    let capturedText = '';
    let capturedUrl = '';
    let capturedNotification = '';

    const mockClipboard: IClipboardNavigator = {
      writeText: async (text: string) => { capturedText = text; }
    };

    const mockLauncher: IWindowLauncher = {
      open: (url: string, target: string) => { capturedUrl = url; }
    };

    const mockNotifier: INotificationChannel = {
      notify: (message: string) => { capturedNotification = message; }
    };

    const service = new ClientInteractionService(registry, mockClipboard, mockLauncher, mockNotifier);
    const status = await service.executeIntegrationFlow('GEMINI', 'Test Prompt String Payload');

    expect(status).toBe(true);
    expect(capturedText).toBe('Test Prompt String Payload');
    expect(capturedUrl).toBe('https://gemini.google.com');
    expect(capturedNotification).toContain('Prompt copied for Google Gemini');
  });
});