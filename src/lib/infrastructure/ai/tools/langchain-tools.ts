/**
 * INFRASTRUCTURE: LangChain Tool Definitions
 * 
 * FUNCTION: Wraps tool implementations with Zod schemas for LLM consumption.
 * Defines the "Interface" that the AI Agents see.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/booking-tools.ts (Implementation)
 * - src/lib/infrastructure/ai/tools/knowledge-tools.ts (Implementation)
 * - src/lib/infrastructure/ai/agents/agent-graph.ts (Consumer)
 */
// src/lib/infrastructure/ai/tools/langchain-tools.ts
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import {
    searchAvailableRooms,
    createBooking,
    getBookingDetails
} from './booking-tools';
import {
    searchKnowledgeBase,
    getPolicyInfo,
    getRestaurantInfo,
    getNearbyAttractions,
    getHotelServices
} from './knowledge-tools';

/**
 * BOOKING TOOLS
 */

export const searchRoomsTool = new DynamicStructuredTool({
    name: 'search_available_rooms',
    description: 'Search for available hotel rooms based on dates and preferences. Returns a list of available rooms with pricing.',
    schema: z.object({
        checkInDate: z.string().describe('Check-in date in ISO format (YYYY-MM-DD)'),
        checkOutDate: z.string().describe('Check-out date in ISO format (YYYY-MM-DD)'),
        guests: z.number().describe('Number of guests'),
        bedSize: z.enum(['single', 'double', 'queen', 'king']).optional().describe('Preferred bed size'),
        viewType: z.enum(['ocean', 'garden', 'city', 'pool']).optional().describe('Preferred view type'),
        maxPrice: z.number().optional().describe('Maximum price per night'),
    }),
    func: async (input) => {
        const result = await searchAvailableRooms(input);
        return JSON.stringify(result);
    },
});

export const createBookingTool = new DynamicStructuredTool({
    name: 'create_booking',
    description: 'Create a new room booking. Only use this after confirming all details with the guest.',
    schema: z.object({
        roomId: z.string().describe('The ID of the room to book'),
        checkInDate: z.string().describe('Check-in date in ISO format'),
        checkOutDate: z.string().describe('Check-out date in ISO format'),
        guestName: z.string().describe('Full name of the guest'),
        guestEmail: z.string().email().describe('Email address of the guest'),
        guestPhone: z.string().describe('Phone number of the guest'),
        numberOfGuests: z.number().describe('Number of guests'),
        specialRequests: z.string().optional().describe('Any special requests or notes'),
    }),
    func: async (input) => {
        const result = await createBooking(input);
        return JSON.stringify(result);
    },
});

export const getBookingTool = new DynamicStructuredTool({
    name: 'get_booking_details',
    description: 'Retrieve booking details using a confirmation number',
    schema: z.object({
        confirmationNumber: z.string().describe('The booking confirmation number'),
    }),
    func: async (input) => {
        const result = await getBookingDetails(input.confirmationNumber);
        return JSON.stringify(result);
    },
});

/**
 * KNOWLEDGE BASE TOOLS
 */

export const searchKnowledgeTool = new DynamicStructuredTool({
    name: 'search_knowledge_base',
    description: 'Search the hotel knowledge base using vector similarity. Returns relevant information about policies, services, restaurants, and attractions.',
    schema: z.object({
        query: z.string().describe('The search query'),
        category: z.enum(['policy', 'service', 'restaurant', 'nearby', 'all']).optional().describe('Filter by category'),
        limit: z.number().default(5).describe('Maximum number of results'),
    }),
    func: async (input) => {
        const result = await searchKnowledgeBase(input);
        return JSON.stringify(result);
    },
});

export const getPolicyTool = new DynamicStructuredTool({
    name: 'get_policy_info',
    description: 'Get specific hotel policy information by category',
    schema: z.object({
        category: z.string().describe('Policy category: check-in, cancellation, payment, pets, amenities, smoking, or general'),
    }),
    func: async (input) => {
        const result = await getPolicyInfo(input.category);
        return JSON.stringify(result);
    },
});

export const getRestaurantTool = new DynamicStructuredTool({
    name: 'get_restaurant_info',
    description: 'Get restaurant information and menus. Optionally specify a restaurant name for detailed menu.',
    schema: z.object({
        restaurantName: z.string().optional().describe('Specific restaurant name, or omit for all restaurants'),
    }),
    func: async (input) => {
        const result = await getRestaurantInfo(input.restaurantName);
        return JSON.stringify(result);
    },
});

export const getNearbyTool = new DynamicStructuredTool({
    name: 'get_nearby_attractions',
    description: 'Get information about nearby attractions, beaches, shopping, and dining options',
    schema: z.object({
        category: z.string().optional().describe('Filter by category: beach, attraction, shopping, dining'),
    }),
    func: async (input) => {
        const result = await getNearbyAttractions(input.category);
        return JSON.stringify(result);
    },
});

export const getServicesTool = new DynamicStructuredTool({
    name: 'get_hotel_services',
    description: 'Get information about hotel services and amenities',
    schema: z.object({
        category: z.string().optional().describe('Filter by category: spa, dining, recreation, concierge, transport'),
    }),
    func: async (input) => {
        const result = await getHotelServices(input.category);
        return JSON.stringify(result);
    },
});

/**
 * ESCALATION TOOL
 */

export const escalateTool = new DynamicStructuredTool({
    name: 'escalate_to_human',
    description: 'Escalate the conversation to a human agent. Use when the issue is complex, emotional, or beyond AI capabilities.',
    schema: z.object({
        reason: z.string().describe('Reason for escalation'),
        urgency: z.enum(['low', 'medium', 'high']).describe('Urgency level'),
        context: z.string().describe('Brief context of the conversation'),
    }),
    func: async (input) => {
        // Log escalation
        console.log('🚨 ESCALATION:', {
            reason: input.reason,
            urgency: input.urgency,
            context: input.context,
            timestamp: new Date().toISOString(),
        });

        // In production: Create ticket, notify staff, etc.

        return JSON.stringify({
            escalated: true,
            message: 'Your request has been forwarded to our customer service team. Someone will contact you shortly via email or phone.',
            ticketId: `ESC-${Date.now()}`, // Mock ticket ID
        });
    },
});

/**
 * Export all tools as an array for LangGraph
 */
export const allTools = [
    searchRoomsTool,
    createBookingTool,
    getBookingTool,
    searchKnowledgeTool,
    getPolicyTool,
    getRestaurantTool,
    getNearbyTool,
    getServicesTool,
    escalateTool,
];

/**
 * Export tools by category
 */
export const bookingTools = [searchRoomsTool, createBookingTool, getBookingTool];
export const knowledgeTools = [searchKnowledgeTool, getPolicyTool, getRestaurantTool, getNearbyTool, getServicesTool];
export const escalationTools = [escalateTool];