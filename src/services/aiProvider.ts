/**
 * PR8.3: AI Provider Abstraction Service
 * Decouples AI inference execution from underlying LLM providers (Gemini, Local Models, etc.).
 */

import { AIContextWindow, AIModelTier } from "../types/aiContext";

export interface AIInferenceRequest {
    requestId: string;
    contextWindow: AIContextWindow;
    systemPrompt: string;
    userQuery: string;
    modelTier: AIModelTier;
    temperature?: number;
    maxTokens?: number;
}

export interface AIInferenceResponse {
    requestId: string;
    providerName: string;
    rawTextResponse: string;
    tokensUsed: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    latencyMs: number;
    completedAt: number;
}

export interface IAIProvider {
    readonly providerName: string;
    executeInference(request: AIInferenceRequest): Promise<AIInferenceResponse>;
}

/**
 * Primary Provider Implementation (e.g. Gemini API Bridge)
 */
export class GeminiHealthProvider implements IAIProvider {
    public readonly providerName = "GeminiHealthProvider";

    public async executeInference(request: AIInferenceRequest): Promise<AIInferenceResponse> {
        const startTime = Date.now();

        // Simulated cloud inference call
        const mockResponseText = `[Gemini Health Interpretation]
` +
            `Subject ${request.contextWindow.userContext.subjectId} exhibits baseline resting HR ` +
            `of ${request.contextWindow.userContext.baseline.avgRestingHeartRate} BPM. ` +
            `Vitals remain within expected physiological bounds.`;

        const latencyMs = Date.now() - startTime + 45; // Simulated network delay

        return {
            requestId: request.requestId,
            providerName: this.providerName,
            rawTextResponse: mockResponseText,
            tokensUsed: {
                promptTokens: request.contextWindow.estimatedTokenCount + 100,
                completionTokens: 65,
                totalTokens: request.contextWindow.estimatedTokenCount + 165
            },
            latencyMs,
            completedAt: Date.now()
        };
    }
}

/**
 * Fallback/Local Edge Provider Implementation
 */
export class FastReasoningLocalProvider implements IAIProvider {
    public readonly providerName = "FastReasoningLocalProvider";

    public async executeInference(request: AIInferenceRequest): Promise<AIInferenceResponse> {
        const startTime = Date.now();

        const mockResponseText = `[Local Fast Reasoning]
` +
            `Vitals snapshot analyzed locally. Resting HR: ` +
            `${request.contextWindow.userContext.baseline.avgRestingHeartRate} BPM. Status: Normal.`;

        return {
            requestId: request.requestId,
            providerName: this.providerName,
            rawTextResponse: mockResponseText,
            tokensUsed: {
                promptTokens: request.contextWindow.estimatedTokenCount + 50,
                completionTokens: 35,
                totalTokens: request.contextWindow.estimatedTokenCount + 85
            },
            latencyMs: Date.now() - startTime + 5,
            completedAt: Date.now()
        };
    }
}

/**
 * Router to direct requests to appropriate provider based on model tier or availability
 */
export class AIProviderRouter {
    private primaryProvider: IAIProvider;
    private fallbackProvider: IAIProvider;

    constructor(primary?: IAIProvider, fallback?: IAIProvider) {
        this.primaryProvider = primary || new GeminiHealthProvider();
        this.fallbackProvider = fallback || new FastReasoningLocalProvider();
    }

    public getProvider(tier: AIModelTier): IAIProvider {
        if (tier === "DEEP_CLINICAL") {
            return this.primaryProvider;
        }
        return this.fallbackProvider;
    }
}
