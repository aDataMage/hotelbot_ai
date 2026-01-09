/**
 * Suggestion Agent
 * 
 * Generates dynamic, context-aware message suggestions based on the conversation.
 * Uses a fast model (gpt-4o-mini) for speed and cost efficiency.
 */
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const SuggestionsSchema = z.object({
    suggestions: z.array(z.string()).min(1).max(4),
});

export type SuggestionResult = z.infer<typeof SuggestionsSchema>;

/**
 * Generate contextual message suggestions based on conversation
 */
export async function generateSuggestions(
    conversationSummary: string,
    lastAssistantMessage: string,
    intent: string
): Promise<string[]> {
    try {
        const result = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: SuggestionsSchema,
            prompt: `You are a helpful assistant for a hotel booking chatbot. Based on the conversation context, generate 2-4 short, natural follow-up messages the user might want to send next.

CURRENT CONTEXT:
- Intent: ${intent}
- Last AI Response: "${lastAssistantMessage.slice(0, 500)}"
- Conversation Summary: ${conversationSummary}

RULES:
1. Keep suggestions SHORT (under 10 words each)
2. Make them feel natural, like something a real person would type
3. Focus on logical next steps based on the conversation
4. Vary the suggestions (don't repeat similar ideas)

EXAMPLES BY INTENT:
- booking: "Show me ocean view rooms", "What's the price for 2 nights?", "Do you have any suites available?"
- knowledge: "What time is check-in?", "Is breakfast included?", "Tell me about the spa"
- service: "I need to speak to a manager", "Can you help with my complaint?"
- general: "What can you help me with?", "I have a question"

Generate relevant suggestions:`,
            temperature: 0.8,
        });

        return result.object.suggestions;
    } catch (error) {
        console.error('Suggestion generation error:', error);
        // Return fallback suggestions
        return [
            "Tell me more",
            "What else can you help with?",
        ];
    }
}

/**
 * Extract conversation summary for context
 */
export function extractConversationContext(messages: any[]): {
    summary: string;
    lastAssistantMessage: string;
} {
    const recentMessages = messages.slice(-6);

    const summary = recentMessages
        .map((m: any) => {
            const role = m.role;
            let content = '';

            if (Array.isArray(m.parts)) {
                content = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join(' ');
            } else if (typeof m.content === 'string') {
                content = m.content;
            }

            return `${role}: ${content.slice(0, 100)}`;
        })
        .join('\n');

    // Find last assistant message
    let lastAssistantMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            const m = messages[i];
            if (Array.isArray(m.parts)) {
                lastAssistantMessage = m.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join(' ');
            } else if (typeof m.content === 'string') {
                lastAssistantMessage = m.content;
            }
            break;
        }
    }

    return { summary, lastAssistantMessage };
}
