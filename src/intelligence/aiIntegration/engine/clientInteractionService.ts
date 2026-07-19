import { AIProviderType } from '../types/aiIntegration';
import { ProviderRegistry } from './providerRegistry';

export interface IClipboardNavigator {
  writeText(text: string): Promise<void>;
}

export interface IWindowLauncher {
  open(url: string, target: string): void;
}

export interface INotificationChannel {
  notify(message: string): void;
}

/**
 * Pure deterministic Client Side Interaction Subsystem.
 * Decouples all hardware-bound Web APIs (Clipboard, Window Navigation, Notification alerts)
 * from React functional layers to guarantee strict modular testability.
 */
export class ClientInteractionService {
  private providerRegistry: ProviderRegistry;
  private clipboard: IClipboardNavigator;
  private launcher: IWindowLauncher;
  private notifier: INotificationChannel;

  constructor(
    providerRegistry: ProviderRegistry,
    clipboard: IClipboardNavigator,
    launcher: IWindowLauncher,
    notifier: INotificationChannel
  ) {
    this.providerRegistry = providerRegistry;
    this.clipboard = clipboard;
    this.launcher = launcher;
    this.notifier = notifier;
  }

  /**
   * Orchestrates the cross-domain copy-and-launch paradigm without side-effect leaks.
   * Copies the compiled payload to the clipboard, opens the window link, and triggers notifications.
   */
  public async executeIntegrationFlow(id: AIProviderType, promptText: string): Promise<boolean> {
    if (!promptText || promptText.trim().length === 0) {
      throw new Error('Cannot process empty execution prompts within the integration layer.');
    }

    try {
      // 1. Commit structured prompt configuration to host clipboard via interface anchor
      await this.clipboard.writeText(promptText);

      // 2. Resolve external target deep link boundary location parameters
      const targetUrl = this.providerRegistry.getLaunchUrl(id);

      // 3. Delegate new browser page instantiation layout window properties
      this.launcher.open(targetUrl, '_blank');

      // 4. Alert user dashboard view container layout configuration details
      const providerName = this.providerRegistry.getProvider(id).name;
      this.notifier.notify(`Prompt copied for ${providerName}. Paste it into your AI chat.`);

      return true;
    } catch (error) {
      this.notifier.notify('Integration execution failure: Verification parameters rejected.');
      return false;
    }
  }
}\n