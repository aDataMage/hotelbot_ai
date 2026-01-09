/**
 * API CONTROLLER: Suggestions
 * 
 * Generates context-aware message suggestions based on the current conversation.
 * Called after each AI response to provide quick reply options.
 */
import { NextResponse } from 'next/server';
import { generateSuggestions, extractConversationContext } from '@/lib/infrastructure/ai/agents/suggestion-agent';
import { quickClassifyIntent } from '@/lib/infrastructure/ai/agents/intent-classifier';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Extract context from conversation
        const { summary, lastAssistantMessage } = extractConversationContext(messages);

        // Get the last user message for intent classification
        let lastUserText = '';
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                const m = messages[i];
                if (Array.isArray(m.parts)) {
                    lastUserText = m.parts
                        .filter((p: any) => p.type === 'text')
                        .map((p: any) => p.text)
                        .join(' ');
                } else if (typeof m.content === 'string') {
                    lastUserText = m.content;
                }
                break;
            }
        }

        // Classify intent for better suggestions
        const intent = quickClassifyIntent(lastUserText);

        // Generate suggestions
        const suggestions = await generateSuggestions(
            summary,
            lastAssistantMessage,
            intent
        );

        return NextResponse.json({ suggestions });

    } catch (error) {
        console.error('Suggestions API Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate suggestions',
                // Fallback suggestions
                suggestions: [
                    "Tell me more",
                    "What else can you help with?"
                ]
            },
            { status: 200 } // Return 200 with fallback so UI doesn't break
        );
    }
}
