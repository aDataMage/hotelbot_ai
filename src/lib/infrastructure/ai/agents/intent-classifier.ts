/**
 * Intent Classifier
 * 
 * Lightweight intent classification for routing to specialized agents.
 * Uses a fast LLM call to classify user intent.
 */
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export type Intent = 'booking' | 'knowledge' | 'service' | 'general';

const IntentSchema = z.object({
    intent: z.enum(['booking', 'knowledge', 'service', 'general']),
    confidence: z.number().min(0).max(1),
});

/**
 * Classify user intent based on their message
 */
export async function classifyIntent(message: string): Promise<{ intent: Intent; confidence: number }> {
    try {
        const result = await generateObject({
            model: openai('gpt-4o-mini'), // Use mini for fast, cheap classification
            schema: IntentSchema,
            prompt: `Classify this hotel guest message into one of these intents:

- booking: Searching rooms, checking availability, making/modifying reservations, dates, guests, prices
- knowledge: Questions about policies, services, amenities, restaurants, menus, nearby attractions
- service: Complaints, special requests, issues, problems, escalation to human staff
- general: Greetings, thanks, small talk, unclear requests

Message: "${message}"

Classify the intent and provide a confidence score (0-1).`,
        });

        return result.object;
    } catch (error) {
        console.error('Intent classification error:', error);
        // Default to general on error
        return { intent: 'general', confidence: 0.5 };
    }
}

/**
 * Quick intent detection using keyword matching (fallback, no LLM call)
 */
export function quickClassifyIntent(message: string): Intent {
    const lower = message.toLowerCase();

    // Service keywords - check first (complaints are urgent)
    const serviceKeywords = [
        'complaint', 'problem', 'issue', 'broken', 'dirty', 'loud', 'noise',
        'refund', 'cancel', 'manager', 'human', 'staff', 'upset',
        'disappointed', 'terrible', 'awful', 'worst'
    ];

    if (serviceKeywords.some(kw => lower.includes(kw))) {
        return 'service';
    }

    // Knowledge keywords - check before booking (questions about hotel)
    const knowledgeKeywords = [
        'policy', 'policies', 'what time', 'when is', 'where is', 'how do', 'hours',
        'restaurant', 'menu', 'food', 'breakfast', 'lunch', 'dinner', 'spa',
        'gym', 'fitness', 'amenities', 'parking', 'wifi', 'pet', 'pets', 'dog', 'cat',
        'attraction', 'nearby', 'things to do', 'landmark', 'landmarks', 'tour', 'tours',
        'smoking', 'cancellation', 'checkout', 'check-out time', 'check-in time'
    ];

    if (knowledgeKeywords.some(kw => lower.includes(kw))) {
        return 'knowledge';
    }

    // Booking keywords
    const bookingKeywords = [
        'book', 'reserve', 'reservation', 'room', 'suite', 'check in', 'check out',
        'check-in', 'check-out', 'stay', 'night', 'guest', 'available', 'availability',
        'price', 'cost', 'rate', 'dates', 'beds', 'king', 'queen', 'view', 'ocean',
        'pool', 'garden'
    ];

    if (bookingKeywords.some(kw => lower.includes(kw))) {
        return 'booking';
    }

    return 'general';
}

