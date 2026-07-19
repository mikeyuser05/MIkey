import { AIProviderType, IProviderConfig } from '../types/aiIntegration';
import { AI_PROVIDERS } from '../config/aiProviderConfig';

/**
 * Pure deterministic AI Provider Registry.
 * Handles resolution, mapping, and URI deep-link targets for external execution channels.
 */
export class ProviderRegistry {
  private providers: Record<AIProviderType, IProviderConfig>;

  constructor(customProviders?: Record<AIProviderType, IProviderConfig>) {
    this.providers = customProviders || (AI_PROVIDERS as Record<AIProviderType, IProviderConfig>);
  }

  /**
   * Retrieves full configuration data parameters for a specific registered target identity.
   */
  public getProvider(id: AIProviderType): IProviderConfig {
    const provider = this.providers[id];
    if (!provider) {
      throw new Error(`Target AI provider type context execution reference not found in registry: ${id}`);
    }
    return provider;
  }

  /**
   * Generates deterministic launch URL parameters for deep-linking.
   */
  public getLaunchUrl(id: AIProviderType): string {
    const provider = this.getProvider(id);
    return provider.baseUrl;
  }

  /**
   * Lists all operational configurations currently registered in the integration matrix layers.
   */
  public getRegisteredProviders(): IProviderConfig[] {
    return Object.values(this.providers);
  }
}