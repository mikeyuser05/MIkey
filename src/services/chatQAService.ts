/**
 * PR9.8: End-to-End Chat & Question Answering Service
 * Unified orchestration layer integrating query intent analysis, structured/semantic retrieval,
 * context assembly, provider execution, history compaction, and clinical safety enforcement.
 */

import { ConversationState } from "../types/aiConversation";
import { UserHealthBaseline } from "../types/aiContext";
import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
import { HealthQueryAnalyzer } from "./healthQueryAnalyzer";
import { StructuredContextRetriever } from "./structuredContextRetriever";
import { ConversationHistoryManager } from "./conversationHistoryManager";
import { MedicalDisclaimerLayer } from "./medicalDisclaimerLayer";
import { AIConversationPipeline } from "./aiConversationPipeline";

export interface ChatQARequest {
    conversationId: string;
    userId: string;
    userQuery: string;
    baseline: UserHealthBaseline;
    records: DailyHealthRecord[];
    events: HealthTimelineEvent[];
}

export interface ChatQAResponse {
    conversationState: ConversationState;
    responseContent: string;
    isEmergencyTriggered: boolean;
    warnings: string[];
}

export class ChatQAService {
    private pipeline: AIConversationPipeline;
    private historyManager: ConversationHistoryManager;
    private disclaimerLayer: MedicalDisclaimerLayer;

    constructor() {
        this.pipeline = new AIConversationPipeline();
        this.historyManager = new ConversationHistoryManager(10);
        this.disclaimerLayer = new MedicalDisclaimerLayer();
    }

    /**
     * Executes end-to-end QA flow over multi-turn conversation sessions
     */
    public async handleUserMessage(request: ChatQARequest): Promise<ChatQAResponse> {
        // 1. Fetch or initialize active conversation state
        let currentState = this.historyManager.getState(request.conversationId) || {
            conversationId: request.conversationId,
            userId: request.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            turns: [],
            activeIntent: "GENERAL_WELLNESS",
            isLockedForSafety: false
        };

        // 2. Execute pipeline processing turn (Analysis -> Retrieval -> Inference)
        const pipelineResult = await this.pipeline.processUserTurn(
            currentState,
            request.userQuery,
            request.baseline,
            request.records,
            request.events
        );

        // 3. Post-process response via Safety & Medical Disclaimer Layer
        const isEmergency = pipelineResult.updatedState.activeIntent === "EMERGENCY_ESCALATION";
        const safetyResult = this.disclaimerLayer.processSafetyRules(
            pipelineResult.assistantResponse,
            isEmergency
        );

        // Update the last assistant turn with sanitized text
        const finalTurns = [...pipelineResult.updatedState.turns];
        if (finalTurns.length > 0 && finalTurns[finalTurns.length - 1].role === "assistant") {
            finalTurns[finalTurns.length - 1].content = safetyResult.sanitizedText;
        }

        const finalState: ConversationState = {
            ...pipelineResult.updatedState,
            turns: finalTurns,
            isLockedForSafety: isEmergency
        };

        // 4. Save compacted history state
        this.historyManager.saveState(finalState);

        return {
            conversationState: finalState,
            responseContent: safetyResult.sanitizedText,
            isEmergencyTriggered: safetyResult.emergencyTriggered,
            warnings: safetyResult.warnings
        };
    }
}
