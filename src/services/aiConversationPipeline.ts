/**
 * PR9.5: AI Conversation Pipeline Service
 * Manages interactive multi-turn dialogue loops with context integration and safety enforcement.
 */

import { ConversationState, ConversationTurn } from "../types/aiConversation";
import { UserHealthBaseline } from "../types/aiContext";
import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { HealthQueryAnalyzer } from "./healthQueryAnalyzer";
import { StructuredContextRetriever } from "./structuredContextRetriever";
import { AIProviderRouter } from "./aiProvider";
import { AIGuardrailController } from "./aiGuardrails";
import { AISafetyGatekeeper } from "./aiSafety";

export class AIConversationPipeline {
    private analyzer: HealthQueryAnalyzer;
    private retriever: StructuredContextRetriever;
    private providerRouter: AIProviderRouter;
    private guardrails: AIGuardrailController;
    private safety: AISafetyGatekeeper;

    constructor() {
        this.analyzer = new HealthQueryAnalyzer();
        this.retriever = new StructuredContextRetriever();
        this.providerRouter = new AIProviderRouter();
        this.guardrails = new AIGuardrailController();
        this.safety = new AISafetyGatekeeper();
    }

    /**
     * Processes a user dialogue turn through analysis, context assembly, inference, and safety filtering
     */
    public async processUserTurn(
        state: ConversationState,
        userQuery: string,
        baseline: UserHealthBaseline,
        records: DailyHealthRecord[],
        events: HealthTimelineEvent[]
    ): Promise<{ updatedState: ConversationState; assistantResponse: string }> {
        const turnTimestamp = Date.now();

        // 1. Query Understanding & Intent Analysis (PR9.2)
        const queryAnalysis = this.analyzer.analyzeQuery(userQuery);

        // 2. Structured Context Retrieval (PR9.3)
        const retrievedContext = this.retriever.retrieveContext(queryAnalysis, baseline, records, events);

        // Record User Turn
        const userTurn: ConversationTurn = {
            turnId: `TURN_USR_${turnTimestamp}`,
            conversationId: state.conversationId,
            role: "user",
            content: userQuery,
            timestamp: turnTimestamp,
            detectedIntent: queryAnalysis.intent
        };

        // 3. Provider Inference Execution (PR8.3 / PR8.5)
        const provider = this.providerRouter.getProvider("FAST_INTERACTIVE");
        
        const systemPrompt = `You are a clinical health AI assistant. Intent: ${queryAnalysis.intent}. ` +
            `Relevant records: ${retrievedContext.relevantRecords.length}. Respond clearly with non-diagnostic guidance.`;

        const rawInference = await provider.executeInference({
            requestId: `REQ_CONV_${turnTimestamp}`,
            contextWindow: {
                systemPrompt,
                anonymizedUserBaseline: baseline,
                dailyHealthHistory: retrievedContext.relevantRecords,
                timelineEvents: retrievedContext.relevantEvents,
                estimatedTokenCount: 500,
                maxAllowedTokens: 2000
            },
            systemPrompt,
            userQuery,
            modelTier: "FAST_INTERACTIVE"
        });

        // 4. Safety Guardrails & Sanitization (PR8.7 / PR9.7)
        let responseText = rawInference.rawTextResponse;
        if (queryAnalysis.intent === "EMERGENCY_ESCALATION") {
            responseText = "CRITICAL ALERT: Your query contains severe emergency health red flags. " +
                "Please seek immediate emergency medical care or call 911/your local emergency hotline immediately.";
        } else {
            responseText += "

DISCLAIMER: For informational purposes only. Consult a physician for diagnostic advice.";
        }

        const assistantTurn: ConversationTurn = {
            turnId: `TURN_AST_${Date.now()}`,
            conversationId: state.conversationId,
            role: "assistant",
            content: responseText,
            timestamp: Date.now(),
            tokensUsed: rawInference.tokensUsed.totalTokens
        };

        const updatedState: ConversationState = {
            ...state,
            updatedAt: Date.now(),
            activeIntent: queryAnalysis.intent,
            isLockedForSafety: queryAnalysis.intent === "EMERGENCY_ESCALATION",
            turns: [...state.turns, userTurn, assistantTurn]
        };

        return {
            updatedState,
            assistantResponse: responseText
        };
    }
}
