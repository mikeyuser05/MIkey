/**
 * PR8.6: AI Health Interpretation Service
 * Orchestrates health context compilation, guardrail checks, provider routing, and contract parsing.
 */

import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { UserHealthBaseline, AIModelTier } from "../types/aiContext";
import { StructuredHealthInterpretation } from "../types/aiContracts";
import { HealthContextBuilder } from "./healthContextBuilder";
import { AIProviderRouter, AIInferenceRequest } from "./aiProvider";
import { AIContractParser } from "./aiContractParser";
import { AIGuardrailController } from "./aiGuardrails";

export class HealthInterpretationService {
    private contextBuilder: HealthContextBuilder;
    private providerRouter: AIProviderRouter;
    private contractParser: AIContractParser;
    private guardrailController: AIGuardrailController;

    constructor(
        contextBuilder?: HealthContextBuilder,
        providerRouter?: AIProviderRouter,
        contractParser?: AIContractParser,
        guardrailController?: AIGuardrailController
    ) {
        this.contextBuilder = contextBuilder || new HealthContextBuilder();
        this.providerRouter = providerRouter || new AIProviderRouter();
        this.contractParser = contractParser || new AIContractParser();
        this.guardrailController = guardrailController || new AIGuardrailController();
    }

    /**
     * Executes end-to-end AI health interpretation with rate/cost guardrails
     */
    public async interpretUserHealth(
        userId: string,
        baseline: UserHealthBaseline,
        dailyRecords: DailyHealthRecord[],
        timelineEvents: HealthTimelineEvent[],
        userQuery: string = "Provide a clinical summary of recent physiological trends.",
        requestedTier: AIModelTier = "DEEP_CLINICAL"
    ): Promise<StructuredHealthInterpretation> {
        const requestId = `REQ_INT_${Date.now()}`;

        // 1. Build token-budgeted context window
        const contextWindow = this.contextBuilder.buildContextWindow(
            userId,
            baseline,
            dailyRecords,
            timelineEvents
        );

        // 2. Validate against guardrails
        const guardrailEval = this.guardrailController.validateRequestExecution(
            contextWindow.estimatedTokenCount,
            requestedTier
        );

        if (!guardrailEval.allowed) {
            throw new Error(`AI Request blocked by guardrails: ${guardrailEval.reason}`);
        }

        const effectiveTier = guardrailEval.recommendedTier;

        // 3. Select AI Provider via Router
        const provider = this.providerRouter.getProvider(effectiveTier);

        // 4. Formulate request contract
        const inferenceRequest: AIInferenceRequest = {
            requestId,
            contextWindow,
            systemPrompt: "You are a clinical AI health assistant. Output structured JSON matching health interpretation schema.",
            userQuery,
            modelTier: effectiveTier
        };

        // 5. Execute inference & record token consumption
        const response = await provider.executeInference(inferenceRequest);
        this.guardrailController.recordUsage(response.tokensUsed.totalTokens, effectiveTier);

        // 6. Parse and return validated interpretation contract
        return this.contractParser.parseInterpretationResponse(response.rawTextResponse, requestId);
    }
}
