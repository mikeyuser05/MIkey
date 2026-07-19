import { AIProviderType } from '../types/aiIntegration';
import { ProviderRegistry } from './providerRegistry';
import { PromptBuilder } from './promptBuilder';
import { ContextBuilder } from './contextBuilder';
import { ClientInteractionService, IClipboardNavigator, IWindowLauncher, INotificationChannel } from './clientInteractionService';

export interface IUseAIIntegrationProps {
  recommendationPayload: any;
  reportPayload: any;
  onNotify: (message: string) => void;
  customClipboard?: IClipboardNavigator;
  customLauncher?: IWindowLauncher;
}

/**
 * Pure architectural coordinator hook abstraction layer.
 * Maps React UI execution gestures to pure modular business domains deterministically.
 */
export const createAIIntegrationController = (props: IUseAIIntegrationProps) => {
  const { recommendationPayload, reportPayload, onNotify, customClipboard, customLauncher } = props;

  // 1. Instantiate engine dependencies deterministically
  const providerRegistry = new ProviderRegistry();
  const promptBuilder = new PromptBuilder();

  // 2. Concrete browser fallback strategies for maximum structural portability
  const clipboardNavigator: IClipboardNavigator = customClipboard || {
    writeText: async (text: string) => {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard Web API infrastructure unavailable in host environment.');
      }
      await navigator.clipboard.writeText(text);
    }
  };

  const windowLauncher: IWindowLauncher = customLauncher || {
    open: (url: string, target: string) => {
      window.open(url, target, 'noopener,noreferrer');
    }
  };

  const notificationChannel: INotificationChannel = {
    notify: (message: string) => onNotify(message)
  };

  const clientService = new ClientInteractionService(
    providerRegistry,
    clipboardNavigator,
    windowLauncher,
    notificationChannel
  );

  /**
   * Primary transactional integration loop action callback executor.
   */
  const handleProviderSelection = async (providerId: AIProviderType): Promise<boolean> => {
    try {
      // Build internal contexts cleanly
      const context = ContextBuilder.assembleContext(recommendationPayload, reportPayload);
      const compiledPrompt = promptBuilder.buildPrompt(context);

      // Execute external context routing loop sequences safely
      return await clientService.executeIntegrationFlow(providerId, compiledPrompt);
    } catch (err: any) {
      notificationChannel.notify(`Integration structural failure: ${err?.message || 'Unknown state'}`);
      return false;
    }
  };

  return {
    handleProviderSelection,
    getAvailableProviders: () => providerRegistry.getRegisteredProviders()
  };
};\n