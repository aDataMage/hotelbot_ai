/**
 * API CONTROLLER: Chat
 * 
 * Multi-Agent Router Architecture
 * Routes user messages to specialized agents based on intent classification.
 * 
 * REFACTORED: Uses ChatOrchestrator for shared logic.
 * AUTH: Passes user session to enable personalized actions.
 */
import { streamText, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { ChatOrchestrator, UserContext } from '@/lib/infrastructure/ai/chat-orchestrator';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Extract auth session for personalized actions
        let userContext: UserContext | undefined;
        try {
            const session = await auth.api.getSession({
                headers: await headers()
            });
            if (session?.user) {
                userContext = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name || undefined,
                    isAuthenticated: true
                };
                console.log('🔐 Chat API: Authenticated user:', userContext.email);
            }
        } catch (authError) {
            // User is not authenticated - continue as guest
            console.log('👤 Chat API: Guest user (no session)');
        }

        // Use Chat Orchestrator for validation, intent, and config
        const {
            isValid,
            validationError,
            modelMessages,
            agentConfig,
            classifiedIntent
        } = await ChatOrchestrator.processMessage(messages, undefined, userContext);

        if (!isValid) {
            return Response.json(
                { error: validationError },
                { status: 400 }
            );
        }

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

        // Add header to indicate which intent was used (useful for debugging/frontend)
        const response = result.toUIMessageStreamResponse();
        response.headers.set('X-Agent-Intent', classifiedIntent);

        return response;

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
