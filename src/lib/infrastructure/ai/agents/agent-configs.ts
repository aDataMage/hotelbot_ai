/**
 * Agent Configurations
 * 
 * Defines tools and system prompts for each specialized agent.
 * Used by the router to configure the AI based on classified intent.
 */
import { tool } from 'ai';
import { z } from 'zod';
import { searchKnowledgeBase } from '../tools/knowledge-tools';
import { createBooking, getMyBookings, cancelMyBooking } from '../tools/booking-tools';
import { getRoomService } from '../../di/container';
import { getPrompt } from '../prompts';
import type { UserContext } from '../chat-orchestrator';

// ============================================================================
// BOOKING AGENT TOOLS
// ============================================================================

export const bookingTools = {
    searchRooms: tool({
        description: 'Search for available rooms based on dates. Only use roomId if the user came from a specific room page.',
        inputSchema: z.object({
            checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
            checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
            numGuests: z.number().describe('Number of guests'),
            roomId: z.string().optional().describe('Specific room ID if provided'),
        }),
        execute: async (params) => {
            try {
                console.log('========== BOOKING AGENT: searchRooms ==========');
                const roomService = getRoomService();
                const checkInDate = new Date(params.checkIn);
                const checkOutDate = new Date(params.checkOut);
                const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                const roomId = params.roomId && params.roomId.trim() !== '' ? params.roomId : undefined;

                const availableRooms = await roomService.findAvailableRoomsForDates(
                    checkInDate,
                    checkOutDate,
                    { roomId, minOccupancy: params.numGuests }
                );

                if (availableRooms.length === 0) {
                    return { success: false, needsPreferences: false, message: "No rooms available for those dates.", rooms: [], totalAvailable: 0 };
                }

                const totalAvailable = availableRooms.length;
                const THRESHOLD = 10;

                // Too many results - ask for preferences
                if (totalAvailable > THRESHOLD && !roomId) {
                    const bedSizes = [...new Set(availableRooms.map(r => r.bedSize))];
                    const viewTypes = [...new Set(availableRooms.map(r => r.viewType))];
                    const priceRange = {
                        min: Math.min(...availableRooms.map(r => r.basePricePerNight)),
                        max: Math.max(...availableRooms.map(r => r.basePricePerNight))
                    };

                    const response = {
                        success: true,
                        needsPreferences: true,
                        message: `I found ${totalAvailable} rooms available! To help you find the perfect room, could you tell me your preferences?`,
                        rooms: [],
                        totalAvailable,
                        availableFilters: { bedSizes, viewTypes, priceRange },
                        suggestedQuestions: [
                            `What bed size do you prefer? (${bedSizes.join(', ')})`,
                            `Any view preference? (${viewTypes.join(', ')})`,
                            `What's your maximum budget per night? ($${priceRange.min} - $${priceRange.max})`
                        ]
                    };
                    console.log('🎯 RETURNING needsPreferences RESPONSE:', JSON.stringify(response, null, 2));
                    return response;
                }

                // Show rooms
                const PAGE_SIZE = 10;
                const displayRooms = availableRooms.sort((a, b) => a.basePricePerNight - b.basePricePerNight).slice(0, PAGE_SIZE);
                const rooms = displayRooms.map(r => {
                    const subtotal = r.basePricePerNight * numberOfNights;
                    const tax = subtotal * 0.1;
                    const serviceCharge = subtotal * 0.05;
                    const total = subtotal + tax + serviceCharge;
                    return {
                        id: r.id, roomNumber: r.roomNumber, name: r.name, description: r.description,
                        bedSize: r.bedSize, viewType: r.viewType, maxOccupancy: r.maxOccupancy, amenities: r.amenities,
                        pricing: { pricePerNight: r.basePricePerNight, numberOfNights, subtotal, tax, serviceCharge, total }
                    };
                });

                return { success: true, needsPreferences: false, message: `Found ${totalAvailable} available room(s).`, rooms, totalAvailable, hasMore: totalAvailable > PAGE_SIZE };
            } catch (error) {
                console.error('searchRooms error:', error);
                return { success: false, message: 'Error searching rooms', rooms: [], error: String(error) };
            }
        },
    }),

    searchRoomsWithPreferences: tool({
        description: 'Search for rooms with specific preferences (bed size, view, max price). Use after user provides preferences.',
        inputSchema: z.object({
            checkIn: z.string().describe('Check-in date (YYYY-MM-DD)'),
            checkOut: z.string().describe('Check-out date (YYYY-MM-DD)'),
            numGuests: z.number().describe('Number of guests'),
            bedSize: z.enum(['single', 'double', 'queen', 'king']).optional(),
            viewType: z.enum(['ocean', 'garden', 'city', 'pool']).optional(),
            maxPricePerNight: z.number().optional(),
            page: z.number().optional().describe('Page number for pagination'),
        }),
        execute: async (params) => {
            try {
                console.log('========== BOOKING AGENT: searchRoomsWithPreferences ==========');
                const roomService = getRoomService();
                const checkInDate = new Date(params.checkIn);
                const checkOutDate = new Date(params.checkOut);
                const numberOfNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                const page = params.page || 1;
                const PAGE_SIZE = 10;

                let availableRooms = await roomService.findAvailableRoomsForDates(
                    checkInDate, checkOutDate,
                    { bedSize: params.bedSize as any, viewType: params.viewType as any, minOccupancy: params.numGuests }
                );

                if (params.maxPricePerNight) {
                    console.log(`💰 Filtering by max price: $${params.maxPricePerNight}/night`);
                    console.log('Before filter:', availableRooms.map(r => ({ name: r.name, price: r.basePricePerNight })));
                    availableRooms = availableRooms.filter(r => r.basePricePerNight <= params.maxPricePerNight!);
                    console.log('After filter:', availableRooms.map(r => ({ name: r.name, price: r.basePricePerNight })));
                }

                if (availableRooms.length === 0) {
                    const filters = [];
                    if (params.bedSize) filters.push(`${params.bedSize} bed`);
                    if (params.viewType) filters.push(`${params.viewType} view`);
                    if (params.maxPricePerNight) filters.push(`under $${params.maxPricePerNight}/night`);
                    return { success: false, message: `No rooms with ${filters.join(' and ')}. Try different preferences?`, rooms: [], totalAvailable: 0 };
                }

                const totalAvailable = availableRooms.length;
                const totalPages = Math.ceil(totalAvailable / PAGE_SIZE);
                const displayRooms = availableRooms.sort((a, b) => a.basePricePerNight - b.basePricePerNight).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

                const rooms = displayRooms.map(r => {
                    const subtotal = r.basePricePerNight * numberOfNights;
                    const tax = subtotal * 0.1;
                    const serviceCharge = subtotal * 0.05;
                    const total = subtotal + tax + serviceCharge;
                    return {
                        id: r.id, roomNumber: r.roomNumber, name: r.name, description: r.description,
                        bedSize: r.bedSize, viewType: r.viewType, maxOccupancy: r.maxOccupancy, amenities: r.amenities,
                        pricing: { pricePerNight: r.basePricePerNight, numberOfNights, subtotal, tax, serviceCharge, total }
                    };
                });

                return { success: true, message: `Found ${totalAvailable} room(s).`, rooms, totalAvailable, currentPage: page, totalPages, hasMore: page < totalPages };
            } catch (error) {
                console.error('searchRoomsWithPreferences error:', error);
                return { success: false, message: 'Error searching rooms', rooms: [], error: String(error) };
            }
        },
    }),

    createBooking: tool({
        description: 'Create a new room booking. Use after guest provides all details.',
        inputSchema: z.object({
            roomId: z.string().describe('Room ID from search results'),
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
        description: 'Show form to collect guest details for booking.',
        inputSchema: z.object({ roomId: z.string() }),
        execute: async ({ roomId }) => ({ roomId, status: 'waiting_for_input' }),
    }),
};

// ============================================================================
// KNOWLEDGE AGENT TOOLS
// ============================================================================

export const knowledgeTools = {
    searchKnowledge: tool({
        description: 'Search hotel knowledge base for policies, services, restaurants, and nearby attractions.',
        inputSchema: z.object({
            query: z.string().describe('The search query'),
            category: z.enum(['policy', 'service', 'restaurant', 'nearby', 'all']).optional(),
            limit: z.number().default(5),
        }),
        execute: async (params) => {
            console.log('========== KNOWLEDGE AGENT: searchKnowledge ==========');
            return await searchKnowledgeBase(params);
        },
    }),
};

// ============================================================================
// SERVICE AGENT TOOLS
// ============================================================================

export const serviceTools = {
    escalateToHuman: tool({
        description: 'Escalate to human agent for complaints, complex issues, or when guest requests human assistance.',
        inputSchema: z.object({
            reason: z.string(),
            urgency: z.enum(['low', 'medium', 'high']),
            context: z.string(),
        }),
        execute: async (params) => {
            console.log('========== SERVICE AGENT: escalateToHuman ==========');
            console.log('ESCALATION:', params);
            return {
                escalated: true,
                message: 'Your request has been forwarded to our customer service team. Someone will contact you shortly.',
                ticketId: `ESC-${Date.now()}`,
                endChat: true, // Signal to end chat after escalation
            };
        },
    }),

    endChat: tool({
        description: `End the chat session and redirect user to home page. Use when:
        - Booking is complete and guest doesn't need more help
        - Guest says goodbye, thanks, or "no more questions"
        - After escalation to human has been confirmed
        - Guest explicitly wants to end the conversation`,
        inputSchema: z.object({
            reason: z.enum(['booking_complete', 'escalated', 'user_goodbye', 'no_further_help']),
            farewell: z.string().describe('A friendly farewell message'),
        }),
        execute: async (params) => {
            console.log('========== END CHAT ==========');
            console.log('Reason:', params.reason);
            return {
                endChat: true,
                reason: params.reason,
                farewell: params.farewell,
                redirectTo: '/',
            };
        },
    }),
};

// ============================================================================
// GET AGENT CONFIG
// ============================================================================

export type Intent = 'booking' | 'knowledge' | 'service' | 'general';

/**
 * Create personalized booking tools that include user context
 */
function createPersonalizedTools(userContext?: UserContext) {
    const userEmail = userContext?.email || '';
    const userName = userContext?.name || '';
    const isAuthenticated = userContext?.isAuthenticated || false;

    return {
        getMyBookings: tool({
            description: 'Get all bookings for the currently logged-in user. Use when user asks to see their reservations.',
            inputSchema: z.object({}),
            execute: async () => {
                if (!isAuthenticated) {
                    return { error: 'Please log in to view your bookings', requiresAuth: true };
                }
                return await getMyBookings(userEmail);
            }
        }),
        cancelMyBooking: tool({
            description: 'Cancel a booking for the logged-in user. Requires confirmation number.',
            inputSchema: z.object({
                confirmationNumber: z.string().describe('The booking confirmation number to cancel')
            }),
            execute: async ({ confirmationNumber }) => {
                if (!isAuthenticated) {
                    return { error: 'Please log in to cancel bookings', requiresAuth: true };
                }
                return await cancelMyBooking(confirmationNumber, userEmail);
            }
        }),
        // Personalized version of requestGuestDetails with prefilled user info
        requestGuestDetails: tool({
            description: 'Show form to collect guest details for booking. If user is logged in, their info is prefilled.',
            inputSchema: z.object({ roomId: z.string() }),
            execute: async ({ roomId }) => ({
                roomId,
                status: 'waiting_for_input',
                prefill: isAuthenticated ? {
                    guestName: userName,
                    guestEmail: userEmail
                } : undefined
            }),
        }),
    };
}

export function getAgentConfig(intent: Intent, userContext?: UserContext) {
    // Create personalized tools if user is authenticated
    const personalizedTools = createPersonalizedTools(userContext);
    const authStatus = userContext?.isAuthenticated
        ? `The user is logged in as ${userContext.name || userContext.email}. You can help them view or cancel their bookings.`
        : 'The user is not logged in. If they want to view or cancel bookings, ask them to log in first.';

    const configs = {
        booking: {
            tools: { ...bookingTools, ...personalizedTools, endChat: serviceTools.endChat },
            systemPrompt: getPrompt('booking') + `\n\n[AUTH STATUS]\n${authStatus}`,
        },
        knowledge: {
            tools: knowledgeTools,
            systemPrompt: getPrompt('knowledge'),
        },
        service: {
            tools: { ...serviceTools, ...personalizedTools },
            systemPrompt: getPrompt('service') + `\n\n[AUTH STATUS]\n${authStatus}`,
        },
        general: {
            tools: { ...bookingTools, ...knowledgeTools, ...serviceTools, ...personalizedTools },
            systemPrompt: getPrompt('general') + `\n\n[AUTH STATUS]\n${authStatus}`,
        },
    };

    return configs[intent];
}
