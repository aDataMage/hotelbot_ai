/**
 * API CONTROLLER: Chat
 * 
 * FUNCTION: Entry point for the AI Chat interface.
 * Handles message streaming, input validation, and tool execution using Vercel AI SDK.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/* (AI Tools)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/ai/agents/* (Agent Graph - potential integration)
 */
// src/app/api/chat/route.ts
import { streamText, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchAvailableRooms } from '@/lib/infrastructure/ai/tools/booking-tools';
import { searchKnowledgeBase } from '@/lib/infrastructure/ai/tools/knowledge-tools';
import { createBooking } from '@/lib/infrastructure/ai/tools/booking-tools';

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
        if (lastMessage.role === 'user') {
            // Extract text from parts array
            const textContent = lastMessage.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join(' ');

            const validation = validateInput(textContent);
            if (!validation.valid) {
                return Response.json(
                    { error: validation.reason },
                    { status: 400 }
                );
            }
        }

        // Convert UI messages to model messages
        const modelMessages = messages.map((msg: any) => {
            // Handle system messages
            if (msg.role === 'system') {
                return {
                    role: 'system',
                    content: msg.parts
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text)
                        .join(' ')
                };
            }

            // Handle user/assistant messages
            return {
                role: msg.role,
                content: msg.parts
                    .filter((part: any) => part.type === 'text')
                    .map((part: any) => part.text)
                    .join(' ')
            };
        });

        // Define AI tools
        const tools = {
            searchRooms: tool({
                description: 'Search for available rooms based on dates and preferences',
                inputSchema: z.object({
                    checkInDate: z.string().describe('Check-in date in ISO format'),
                    checkOutDate: z.string().describe('Check-out date in ISO format'),
                    guests: z.number().describe('Number of guests'),
                    bedSize: z.enum(['single', 'double', 'queen', 'king']).optional(),
                    viewType: z.enum(['ocean', 'garden', 'city', 'pool']).optional(),
                    maxPrice: z.number().optional(),
                }),
                execute: async (params) => {
                    return await searchAvailableRooms(params);
                },
            }),

            searchKnowledge: tool({
                description: 'Search the hotel knowledge base for policies, services, restaurants, and nearby attractions',
                inputSchema: z.object({
                    query: z.string().describe('The search query'),
                    category: z.enum(['policy', 'service', 'restaurant', 'nearby', 'all']).optional(),
                    limit: z.number().default(5),
                }),
                execute: async (params) => {
                    return await searchKnowledgeBase(params);
                },
            }),

            createBooking: tool({
                description: 'Create a new room booking. Only use this when the user has confirmed all details. IMPORTANT: Use the exact room "id" field from searchRooms results (NOT the roomNumber or name).',
                inputSchema: z.object({
                    roomId: z.string().describe('The room id from searchRooms results (e.g., "abc123xyz"). NOT the room number - use the "id" field.'),
                    checkInDate: z.string(),
                    checkOutDate: z.string(),
                    guestName: z.string(),
                    guestEmail: z.string().email(),
                    guestPhone: z.string(),
                    numberOfGuests: z.number(),
                    specialRequests: z.string().optional(),
                }),
                execute: async (params) => {
                    return await createBooking(params);
                },
            }),

            escalateToHuman: tool({
                description: 'Escalate the conversation to a human agent when needed',
                inputSchema: z.object({
                    reason: z.string(),
                    urgency: z.enum(['low', 'medium', 'high']),
                    context: z.string(),
                }),
                execute: async (params) => {
                    // Log escalation
                    console.log('ESCALATION:', params);
                    return {
                        escalated: true,
                        message: 'Your request has been forwarded to our customer service team. Someone will contact you shortly.',
                    };
                },
            }),
        };

        // Stream response with AI SDK 6
        const result = streamText({
            model: openai('gpt-4o'),
            stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and responses
            messages: modelMessages,
            system: `You are an AI-powered hotel concierge assistant for HotelAI.

Your Capabilities:
- Help guests search and book rooms
- Answer questions about hotel policies, services, amenities
- Provide information about on-site restaurants and menus
- Suggest nearby attractions and activities
- Handle complaints and special requests professionally

Your Approach:
1. Be warm, professional, and helpful
2. Always confirm details before booking
3. Ask clarifying questions when needed
4. Provide specific, accurate information
5. Use tools to search knowledge base and availability
6. NEVER make up information - use searchKnowledge tool
7. For bookings: confirm all details (dates, room, guest info) before using createBooking
8. Escalate to human for: safety issues, legal matters, highly emotional situations

Booking Process:
1. Ask for: check-in date, check-out date, number of guests
2. Use searchRooms to find available options
3. Present 2-3 best matches with prices
4. Confirm guest details (name, email, phone)
5. Only then use createBooking tool

Knowledge Base Categories:
- policy: check-in/out times, cancellation, payment, pets, smoking
- service: spa, pool, fitness, concierge
- restaurant: dining options, menus, hours
- nearby: attractions, beaches, shopping, activities

Current Date: ${new Date().toISOString().split('T')[0]}

Remember: Be helpful but never compromise guest privacy or hotel security.`,
            tools,
            temperature: 0.7,
            onFinish: async ({ text, toolCalls, finishReason, usage }) => {
                // Log for monitoring
                console.log('AI Response:', {
                    textLength: text.length,
                    toolCallsCount: toolCalls?.length || 0,
                    finishReason,
                    tokens: usage,
                });

                // Check for output guardrails
                if (text.toLowerCase().includes('you are') || text.toLowerCase().includes('your role')) {
                    console.warn('GUARDRAIL VIOLATION: Potential system prompt leakage');
                }
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