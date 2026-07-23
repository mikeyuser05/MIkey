/**
 * PR9.6: Conversation History Service
 * Manages state persistence, sliding window memory pruning, and session restoration.
 */

import { ConversationState, ConversationTurn } from "../types/aiConversation";

export class ConversationHistoryManager {
    private storage: Map<string, ConversationState> = new Map();
    private readonly maxTurnsPerSession: number;

    constructor(maxTurnsPerSession: number = 10) {
        this.maxTurnsPerSession = maxTurnsPerSession;
    }

    /**
     * Saves or updates a conversation session in persistence store
     */
    public saveState(state: ConversationState): void {
        const compactedState = this.applySlidingWindow(state);
        this.storage.set(compactedState.conversationId, compactedState);
    }

    /**
     * Fetches stored conversation state by ID
     */
    public getState(conversationId: string): ConversationState | undefined {
        return this.storage.get(conversationId);
    }

    /**
     * Prunes legacy turns to enforce token budget limits while retaining context
     */
    public applySlidingWindow(state: ConversationState): ConversationState {
        if (state.turns.length <= this.maxTurnsPerSession) {
            return state;
        }

        // Preserve first user turn for intent continuity, take most recent (maxTurnsPerSession - 1) turns
        const firstTurn = state.turns[0];
        const recentTurns = state.turns.slice(-(this.maxTurnsPerSession - 1));

        return {
            ...state,
            turns: [firstTurn, ...recentTurns]
        };
    }
}
