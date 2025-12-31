/**
 * API CONTROLLER: Chat
 * 
 * Multi-Agent Router Architecture
 * Routes user messages to specialized agents based on intent classification.
 */
import { streamText, stepCountIs, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { quickClassifyIntent } from '@/lib/infrastructure/ai/agents/intent-classifier';
import { getAgentConfig, Intent } from '@/lib/infrastructure/ai/agents/agent-configs';

// Guardrails: Input validation
function validateInput(content: string): { valid: boolean; reason?: string } {
    if (content.length > 2000) {
        return { valid: false, reason: 'Message too long' };
    }

    const injectionPatterns = [
        /ignore previous instructions/i,
        /disregard all/i,
        /you are now/i,
        /system:/i,
    ];

    for (const pattern of injectionPatterns) {
        if (pattern.test(content)) {
            return { valid: false, reason: 'Potentially harmful content detected' };
        }
    }

    return { valid: true };
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Validate last user message
        const lastMessage = messages[messages.length - 1];
        let userText = '';

        if (lastMessage.role === 'user') {
            // Handle both 'parts' (AI SDK 3.3+ multi-modal) and 'content' (standard/legacy)
            if (Array.isArray(lastMessage.parts)) {
                userText = lastMessage.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join(' ');
            } else if (typeof lastMessage.content === 'string') {
                userText = lastMessage.content;
            } else {
                userText = ''; // Fallback
            }

            const validation = validateInput(userText);
            if (!validation.valid) {
                return Response.json(
                    { error: validation.reason },
                    { status: 400 }
                );
            }
        }

        // Convert UI messages to model messages
        let modelMessages;
        try {
            modelMessages = await convertToModelMessages(messages);
        } catch (err) {
            console.warn('convertToModelMessages failed, falling back to manual conversion:', err);
            modelMessages = messages.map((m: any) => ({
                role: m.role,
                content: m.content || (Array.isArray(m.parts) ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')
            }));
        }

        // Build conversation context for intent classification
        const recentMessages = messages.slice(-6); // Last 3 exchanges
        const conversationContext = recentMessages
            .map((m: any) => {
                if (m.parts) {
                    return m.parts
                        .filter((p: any) => p.type === 'text')
                        .map((p: any) => p.text)
                        .join(' ');
                }
                return m.content || '';
            })
            .join(' ')
            .toLowerCase();

        // Check if we're in an active booking flow
        const isBookingFlow = conversationContext.includes('book') ||
            conversationContext.includes('room') ||
            conversationContext.includes('check in') ||
            conversationContext.includes('check-in') ||
            conversationContext.includes('guests') ||
            conversationContext.includes('night');

        // Classify intent with context awareness
        let intent = quickClassifyIntent(userText) as Intent;

        // Only override general → booking if we're in booking flow
        // DO NOT override knowledge or service intents
        if (intent === 'general' && isBookingFlow) {
            intent = 'booking';
            console.log('🔄 Context override: general → booking (in booking flow)');
        }

        console.log(`🎯 INTENT CLASSIFIED: ${intent} for message: "${userText.substring(0, 50)}..."`);

        const agentConfig = getAgentConfig(intent);

        // Stream response with specialized agent
        const result = streamText({
            model: openai('gpt-4o'),
            stopWhen: stepCountIs(5),
            messages: modelMessages,
            system: agentConfig.systemPrompt,
            tools: agentConfig.tools,
            toolChoice: 'auto',
            temperature: 0.7,
        });

        return result.toUIMessageStreamResponse();

    } catch (error) {
        console.error('Chat API Error:', error);
        return Response.json(
            {
                error: 'Failed to process chat message',
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}