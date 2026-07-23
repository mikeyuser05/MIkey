/**
 * PR8.8: PR8 Integration and Validation Orchestrator
 * Full pipeline orchestrator integrating PR8.1 - PR8.7 services.
 */

import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { UserHealthBaseline, AIModelTier } from "../types/aiContext";
import { StructuredHealthInterpretation } from "../types/aiContracts";
import { HealthContextBuilder } from "./healthContextBuilder";
import { AIProviderRouter, AIInferenceRequest } from "./aiProvider";
import { AIContractParser } from "./aiContractParser";
import { AIGuardrailController } from "./aiGuardrails";
import { AISafetyGatekeeper } from "./aiSafety";

export class AIHealthOrchestrator {
    private contextBuilder: HealthContextBuilder;
    private providerRouter: AIProviderRouter;
    private contractParser: AIContractParser;
    private guardrailController: AIGuardrailController;
    private safetyGatekeeper: AISafetyGatekeeper;

    constructor() {
        this.contextBuilder = new HealthContextBuilder();
        this.providerRouter = new AIProviderRouter();
        this.contractParser = new AIContractParser();
        this.guardrailController = new AIGuardrailController();
        this.safetyGatekeeper = new AISafetyGatekeeper();
    }

    /**
     * Complete AI health interpretation pipeline
     */
    public async processHealthInterpretation(
        userId: string,
        baseline: UserHealthBaseline,
        dailyRecords: DailyHealthRecord[],
        timelineEvents: HealthTimelineEvent[],
        userQuery: string,
        requestedTier: AIModelTier = "DEEP_CLINICAL"
    ): Promise<StructuredHealthInterpretation> {
        const requestId = `REQ_ORCH_${Date.now()}`;

        // Step 1: Build context window (PR8.1 & PR8.2)
        const contextWindow = this.contextBuilder.buildContextWindow(
            userId,
            baseline,
            dailyRecords,
            timelineEvents
        );

        // Step 2: Validate cost and rate guardrails (PR8.5)
        const guardrailEval = this.guardrailController.validateRequestExecution(
            contextWindow.estimatedTokenCount,
            requestedTier
        );

        if (!guardrailEval.allowed) {
            throw new Error(`Execution blocked by rate/cost guardrail: ${guardrailEval.reason}`);
        }

        const effectiveTier = guardrailEval.recommendedTier;

        // Step 3: Route request to appropriate provider (PR8.3)
        const provider = this.providerRouter.getProvider(effectiveTier);
        const inferenceRequest: AIInferenceRequest = {
            requestId,
            contextWindow,
            systemPrompt: "You are an AI clinical health assistant.",
            userQuery,
            modelTier: effectiveTier
        };

        // Step 4: Execute inference and record telemetry usage
        const rawResponse = await provider.executeInference(inferenceRequest);
        this.guardrailController.recordUsage(rawResponse.tokensUsed.totalTokens, effectiveTier);

        // Step 5: Parse and enforce contract structure (PR8.4)
        const structuredInterpretation = this.contractParser.parseInterpretationResponse(
            rawResponse.rawTextResponse,
            requestId
        );

        // Step 6: Apply clinical safety checks & disclaimers (PR8.7)
        return this.safetyGatekeeper.applySafetyGuardrails(structuredInterpretation);
    }
}
