import { convertToModelMessages } from 'ai';
import { quickClassifyIntent, classifyIntent, Intent } from '@/lib/infrastructure/ai/agents/intent-classifier';
import { getAgentConfig } from '@/lib/infrastructure/ai/agents/agent-configs';

export type ChatProcessingResult = {
    isValid: boolean;
    validationError?: string;
    modelMessages: any[];
    agentConfig: {
        systemPrompt: string;
        tools: any;
        toolChoice?: any;
    };
    classifiedIntent: Intent;
};

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

export class ChatOrchestrator {
    /**
     * Orchestrates the chat process:
     * 1. Validates input
     * 2. Converts messages
     * 3. Classifies Intent
     * 4. Returns Config & Messages
     */
    static async processMessage(
        messages: any[], // UI messages or generic array
        lastUserTextOverride?: string // Optional override if messages are complex
    ): Promise<ChatProcessingResult> {
        // 1. Extract and Validate User Text
        const lastMessage = messages[messages.length - 1];
        let userText = lastUserTextOverride || '';

        if (!userText && lastMessage && lastMessage.role === 'user') {
            if (Array.isArray(lastMessage.parts)) {
                userText = lastMessage.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join(' ');
            } else if (typeof lastMessage.content === 'string') {
                userText = lastMessage.content;
            }
        }

        if (userText) {
            const validation = validateInput(userText);
            if (!validation.valid) {
                // Return early but we needs to match structure. 
                // Actually we should simple throw or return an error state.
                return {
                    isValid: false,
                    validationError: validation.reason,
                    modelMessages: [],
                    agentConfig: {} as any,
                    classifiedIntent: 'general'
                };
            }
        }

        // 2. Convert to Model Messages
        let modelMessages: any[];

        // Check if messages effectively look like CoreMessages already (simple objects with role/content)
        // This avoids the overhead/errors of convertToModelMessages for backend-only messages
        const looksLikeCoreMessages = messages.every(m =>
            (m.role && typeof m.content === 'string') ||
            (m.role && Array.isArray(m.content))
        );

        if (looksLikeCoreMessages) {
            modelMessages = messages;
        } else {
            try {
                // Try converting UI messages
                modelMessages = await convertToModelMessages(messages);
            } catch (err) {
                // Silent fallback for mixed types or simple objects that failed validation
                // console.warn('convertToModelMessages failed, using manual conversion');
                modelMessages = messages.map((m: any) => ({
                    role: m.role,
                    content: m.content || (Array.isArray(m.parts) ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : '')
                })) as any[];
            }
        }

        // 3. Build Context for Classification
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

        // 4. Determine Intent
        const isBookingFlow = conversationContext.includes('book') ||
            conversationContext.includes('room') ||
            conversationContext.includes('check in') ||
            conversationContext.includes('check-in') ||
            conversationContext.includes('guests') ||
            conversationContext.includes('night');

        let intent = quickClassifyIntent(userText) as Intent;

        // Context override
        if (intent === 'general' && isBookingFlow) {
            intent = 'booking';
            console.log('🔄 ChatOrchestrator: Context override: general → booking');
        }

        console.log(`🎯 ChatOrchestrator: Classified INTENT: ${intent}`);

        // 5. Get Config
        const agentConfig = getAgentConfig(intent);

        return {
            isValid: true,
            modelMessages,
            agentConfig: {
                systemPrompt: agentConfig.systemPrompt,
                tools: agentConfig.tools,
                toolChoice: 'auto'
            },
            classifiedIntent: intent
        };
    }
}
