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
            // Extract text from parts array
            userText = lastMessage.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join(' ');

            const validation = validateInput(userText);
            if (!validation.valid) {
                return Response.json(
                    { error: validation.reason },
                    { status: 400 }
                );
            }
        }

        // Convert UI messages to model messages
        const modelMessages = await convertToModelMessages(messages);

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
            onChunk: ({ chunk }) => {
                // Log each chunk for debugging
                if (chunk.type === 'text-delta' && chunk.textDelta) {
                    process.stdout.write(chunk.textDelta);
                }
            },
            onFinish: async ({ text, toolCalls, finishReason, usage }) => {
                console.log('\n========== AI RESPONSE COMPLETE ==========');
                console.log(`AI Response [${intent}]:`, {
                    textLength: text.length,
                    textPreview: text.substring(0, 100) + '...',
                    toolCallsCount: toolCalls?.length || 0,
                    finishReason,
                });
            },
        });

        return result.toUIMessageStreamResponse();

    } catch (error) {
        console.error('Chat API Error:', error);
        return Response.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}