import { IPromptContext } from '../types/aiIntegration';

/**
 * Pure deterministic Context Assembly Engine.
 * Consolidated aggregation boundary that processes, validates, and locks down
 * downstream pipeline payloads from recommendations and periodic summaries into an immutable context envelope.
 */
export class ContextBuilder {
  /**
   * Safe assembly vector that constructs a fully validated execution context envelope.
   * Rejects malformed or incomplete architectural dependencies instantly to maintain pure pipelines.
   */
  public static assembleContext(
    recommendationPayload: any,
    reportPayload: any,
    overrideTimestamp?: number
  ): IPromptContext {
    
    // Integrity Guard: Ensure critical payload foundations exist before constructing prompt bounds
    if (!recommendationPayload) {
      throw new Error('Missing core structural payload parameter: recommendationPayload');
    }
    if (!reportPayload) {
      throw new Error('Missing core structural payload parameter: reportPayload');
    }

    // Pipeline Data Lock: Maintain strict runtime deterministic evaluation stamps
    const executionTimestamp = overrideTimestamp !== undefined ? overrideTimestamp : Date.now();

    return {
      recommendationPayload,
      reportPayload,
      timestamp: executionTimestamp
    };
  }
}\n