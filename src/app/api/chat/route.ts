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
import { streamText, tool, stepCountIs, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { searchAvailableRooms } from '@/lib/infrastructure/ai/tools/booking-tools';
import { searchKnowledgeBase } from '@/lib/infrastructure/ai/tools/knowledge-tools';
import { createBooking } from '@/lib/infrastructure/ai/tools/booking-tools';
import { getRoomService } from '@/lib/infrastructure/di/container';

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
        const modelMessages = await convertToModelMessages(messages);

        // Define AI tools
        const tools = {
            searchRooms: tool({
                description: 'Search for available rooms based on dates and criteria. Returns a list of available rooms or an explicit message.',
                inputSchema: z.object({
                    checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
                    checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
                    numGuests: z.number().describe('Number of guests'),
                    roomId: z.string().optional().describe('Specific room ID to check availability for'),
                    bedSize: z.enum(['single', 'double', 'queen', 'king']).optional(),
                    viewType: z.enum(['ocean', 'garden', 'city', 'pool']).optional(),
                }),
                execute: async (params) => {
                    const roomService = getRoomService();
                    const checkInDate = new Date(params.checkIn);
                    const checkOutDate = new Date(params.checkOut);

                    // Calculate number of nights
                    const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

                    const availableRooms = await roomService.findAvailableRoomsForDates(
                        checkInDate,
                        checkOutDate,
                        {
                            roomId: params.roomId,
                            bedSize: params.roomId ? undefined : params.bedSize as any,
                            viewType: params.roomId ? undefined : params.viewType as any,
                            minOccupancy: params.numGuests
                        }
                    );

                    if (availableRooms.length === 0) {
                        return {
                            success: false,
                            message: "No rooms match your criteria for those dates.",
                            rooms: []
                        };
                    }

                    const rooms = availableRooms.map(r => {
                        const subtotal = r.basePricePerNight * numberOfNights;
                        const tax = subtotal * 0.1;
                        const serviceCharge = subtotal * 0.05;
                        const total = subtotal + tax + serviceCharge;

                        return {
                            id: r.id,
                            roomNumber: r.roomNumber,
                            name: r.name,
                            description: r.description,
                            bedSize: r.bedSize,
                            viewType: r.viewType,
                            maxOccupancy: r.maxOccupancy,
                            amenities: r.amenities,
                            pricing: {
                                pricePerNight: r.basePricePerNight,
                                numberOfNights,
                                subtotal,
                                tax,
                                serviceCharge,
                                total
                            }
                        };
                    });

                    console.log('SEARCH ROOMS SUCCESS:', rooms);

                    return {
                        success: true,
                        message: `Found ${rooms.length} available room(s).`,
                        rooms
                    };
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
                description: 'Create a new room booking. This triggers a visual confirmation card in the UI. Do NOT describe the booking details in text, just call this tool.',
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

            requestGuestDetails: tool({
                description: 'Ask the user to provide their details (name, email, phone) for a booking via a structured form.',
                inputSchema: z.object({
                    roomId: z.string().describe('The room ID being booked'),
                }),
                execute: async ({ roomId }) => {
                    return { roomId, status: 'waiting_for_input' };
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

        const systemPrompt = `
You are an AI-powered hotel concierge assistant for HotelAI.

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
7. Escalate to human for: safety issues, legal matters, highly emotional situations

CRITICAL BOOKING RULES:
1. You MUST call searchRooms FIRST before ANY booking attempt
2. The searchRooms tool returns rooms with an "id" field (e.g., "vyu2l31s2lmmdaejb19i8qyp")
3. When calling createBooking, you MUST use the EXACT "id" value from searchRooms results
4. NEVER make up room IDs - they are random strings like "abc123xyz456"
5. If you don't have a valid room ID from a recent search, call searchRooms again
6. The roomNumber (e.g., "101", "201") is NOT the room ID - never use it as roomId
7. IMPERATIVE: If the searchRooms tool returns ANY results (even 1), you MUST present them to the user. Do not claim they are unavailable.
8. If the searchRooms result list is NOT empty, verify with "Would you like to book [Room Name]?"

Booking Process:
1. Ask for: check-in date, check-out date, number of guests.
   - EXCEPTION: If the user provides a specific "Room ID" or name (e.g. they came from a specific room page):
     - IF dates are provided: Immediately call searchRooms with that roomId.
     - IF dates are MISSING: Ask for check-in and check-out dates ONLY. Do not ask for other preferences.
2. Use searchRooms to find available options - STORE THE ROOM IDs FROM THE RESPONSE
3. After searchRooms: DO NOT describe rooms in text - the UI automatically displays room cards
4. Ask which room they prefer
5. ONCE A ROOM IS SELECTED (or if user says "nice", "ok", "book it", "I'll take it"): Call requestGuestDetails tool IMMEDIATELY to show the form. DO NOT just say "Please fill out this form" without calling the tool.
6. When the tool result contains details: Call createBooking with the room "id" and details
7. After createBooking: The UI shows the confirmation card. Output ONLY: "Your booking is confirmed!"

UI RESPONSE RULES:
- The searchRooms tool returns an object with { success: boolean, message: string, rooms: [...] }
- If success is TRUE: Offer the room(s) to the user. Say "The [Room Name] is available for your dates. Would you like to book it?"
- If success is FALSE: Only then say there are no available rooms.
- CRITICAL: If the tool result contains rooms, do NOT say "No rooms available". Read the 'success' field.
- When requestGuestDetails is called: Just say "Please fill out this form." (UI shows form)
- When createBooking succeeds: output ONLY "Your booking is confirmed!"
- WARNING: NEVER repeat details like prices, dates, or confirmation numbers in text. The UI cards handle all of that.

Knowledge Base Categories:
- policy: check-in/out times, cancellation, payment, pets, smoking
- service: spa, pool, fitness, concierge
- restaurant: dining options, menus, hours
- nearby: attractions, beaches, shopping, activities

Current Date: ${new Date().toISOString().split('T')[0]}

Remember: Be helpful but never compromise guest privacy or hotel security.`;

        // Stream response with AI SDK 6
        const result = streamText({
            model: openai('gpt-4o'),
            stopWhen: stepCountIs(5), // Allow up to 5 steps for tool calls and responses
            messages: modelMessages,
            system: systemPrompt,
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