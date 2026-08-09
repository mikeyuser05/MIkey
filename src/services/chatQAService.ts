/**
 * PR9.8: End-to-End Chat & Question Answering Service
 */

import { ConversationState } from "../types/aiConversation";
import { UserHealthBaseline } from "../types/aiContext";
import { DailyHealthRecord, HealthTimelineEvent } from "../types/healthHistory";
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

    public async handleUserMessage(request: ChatQARequest): Promise<ChatQAResponse> {
        let currentState = this.historyManager.getState(request.conversationId) || {
            conversationId: request.conversationId,
            userId: request.userId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            turns: [],
            activeIntent: "GENERAL_WELLNESS",
            isLockedForSafety: false
        };

        // Pipeline execution match
        const pipelineResult = await (this.pipeline as any).processUserTurn 
            ? await (this.pipeline as any).processUserTurn(currentState, request.userQuery, request.baseline, request.records, request.events)
            : await (this.pipeline as any).executeTurn(currentState, request.userQuery, request.baseline, request.records, request.events);

        const isEmergency = pipelineResult.updatedState.activeIntent === "EMERGENCY_ESCALATION";
        
        // Safety evaluation safely typed
        const safetyEval = (this.disclaimerLayer as any).processSafetyRules(
            pipelineResult.assistantResponse,
            isEmergency
        );

        const sanitizedText = safetyEval.sanitizedResponse || safetyEval.sanitizedText || pipelineResult.assistantResponse;

        const finalTurns = [...pipelineResult.updatedState.turns];
        if (finalTurns.length > 0 && finalTurns[finalTurns.length - 1].role === "assistant") {
            finalTurns[finalTurns.length - 1].content = sanitizedText;
        }

        const finalState: ConversationState = {
            ...pipelineResult.updatedState,
            turns: finalTurns,
            isLockedForSafety: isEmergency
        };

        this.historyManager.saveState(finalState);

        return {
            conversationState: finalState,
            responseContent: sanitizedText,
            isEmergencyTriggered: safetyEval.isEmergencyTriggered ?? isEmergency,
            warnings: safetyEval.warnings || []
        };
    }
}