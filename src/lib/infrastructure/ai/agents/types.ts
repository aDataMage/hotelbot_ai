// src/lib/infrastructure/ai/agents/types.ts
import { BaseMessage } from '@langchain/core/messages';
import { Annotation } from '@langchain/langgraph';

/**
 * Main agent state shared across all nodes
 * Using LangGraph Annotation API for proper state management
 */
export const AgentState = Annotation.Root({
    /**
     * Conversation messages
     */
    messages: Annotation<BaseMessage[]>({
        reducer: (current, update) => current.concat(update),
        default: () => [],
    }),

    /**
     * Classified user intent
     */
    intent: Annotation<'booking' | 'faq' | 'customer_service' | 'greeting' | 'unknown' | null>({
        reducer: (_, update) => update,
        default: () => null,
    }),

    /**
     * Confidence score for intent classification
     */
    confidence: Annotation<number>({
        reducer: (_, update) => update,
        default: () => 0,
    }),

    /**
     * Booking context (accumulated during conversation)
     */
    bookingContext: Annotation<BookingContext | null>({
        reducer: (current, update) => {
            if (!update) return current;
            return { ...current, ...update };
        },
        default: () => null,
    }),

    /**
     * Knowledge base search results
     */
    searchResults: Annotation<any[] | null>({
        reducer: (_, update) => update,
        default: () => null,
    }),

    /**
     * Flag to escalate to human
     */
    requiresHuman: Annotation<boolean>({
        reducer: (_, update) => update,
        default: () => false,
    }),

    /**
     * Next action to take
     */
    nextAction: Annotation<'continue' | 'end' | 'escalate' | null>({
        reducer: (_, update) => update,
        default: () => null,
    }),

    /**
     * Error tracking
     */
    error: Annotation<string | null>({
        reducer: (_, update) => update,
        default: () => null,
    }),
});

/**
 * Booking context accumulated during conversation
 */
export interface BookingContext {
    checkInDate?: string;
    checkOutDate?: string;
    numberOfGuests?: number;
    bedSize?: 'single' | 'double' | 'queen' | 'king';
    viewType?: 'ocean' | 'garden' | 'city' | 'pool';
    maxPrice?: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests?: string;
    selectedRoomId?: string;
    confirmationNumber?: string;
}

/**
 * Intent classification result
 */
export interface IntentClassification {
    intent: 'booking' | 'faq' | 'customer_service' | 'greeting' | 'unknown';
    confidence: number;
    reasoning: string;
}

/**
 * Tool execution result
 */
export interface ToolResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}