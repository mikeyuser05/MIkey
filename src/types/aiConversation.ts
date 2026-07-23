/**
 * PR9.1: Conversational Health Architecture
 * Domain interfaces and data structures for interactive multi-turn health dialogs.
 */

export type ConversationRole = "user" | "assistant" | "system";

export type HealthQueryIntent =
    | "SYMPTOM_CHECK"
    | "VITAL_TREND_ANALYSIS"
    | "MEDICATION_INQUIRY"
    | "GENERAL_WELLNESS"
    | "EMERGENCY_ESCALATION"
    | "UNKNOWN";

export interface ContextReference {
    recordId?: string;
    eventType?: string;
    timeframeIso?: string;
    source: "DAILY_RECORD" | "TIMELINE_EVENT" | "USER_BASELINE";
}

export interface ConversationTurn {
    turnId: string;
    conversationId: string;
    role: ConversationRole;
    content: string;
    timestamp: number;
    detectedIntent?: HealthQueryIntent;
    contextReferences?: ContextReference[];
    tokensUsed?: number;
}

export interface ConversationState {
    conversationId: string;
    userId: string;
    createdAt: number;
    updatedAt: number;
    turns: ConversationTurn[];
    activeIntent: HealthQueryIntent;
    isLockedForSafety: boolean;
}
