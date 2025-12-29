/**
 * INFRASTRUCTURE: AI Tool Implementations (Knowledge)
 * 
 * FUNCTION: Implements the logic for knowledge retrieval (RAG).
 * Interacts with Qdrant (Vector DB) and OpenAI (Embeddings).
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/langchain-tools.ts (Tool Wrappers)
 * - src/lib/infrastructure/database/schema.ts (Data Source)
 */
// src/lib/infrastructure/ai/tools/knowledge-tools.ts
import { QdrantClient } from '@qdrant/qdrant-js';
import OpenAI from 'openai';
import { db } from '@/lib/infrastructure/database/drizzle';
import { policies, services, restaurants, menuItems, nearbySpots } from '@/lib/infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI();

const COLLECTION_NAME = 'hotel_knowledge';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

/**
 * Generate embeddings using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const result = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text,
        });
        return result.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Search knowledge base using vector similarity
 */
export async function searchKnowledgeBase(params: {
    query: string;
    category?: 'policy' | 'service' | 'restaurant' | 'nearby' | 'all';
    limit?: number;
}) {
    try {
        const { query, category = 'all', limit = 5 } = params;

        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);

        // Search Qdrant
        const searchParams: any = {
            vector: queryEmbedding,
            limit,
            with_payload: true,
            score_threshold: 0.7, // Only return results with similarity > 0.7
        };

        // Add category filter if specified
        if (category !== 'all') {
            searchParams.filter = {
                must: [
                    {
                        key: 'category',
                        match: { value: category },
                    },
                ],
            };
        }

        const searchResults = await qdrant.search(COLLECTION_NAME, searchParams);

        if (searchResults.length === 0) {
            return {
                message: 'No relevant information found in our knowledge base',
                suggestion: 'Try rephrasing your question or contact our customer service',
            };
        }

        // Format results
        const results = searchResults.map((result) => ({
            content: result.payload?.content || '',
            title: result.payload?.title || '',
            category: result.payload?.category || '',
            score: result.score,
            metadata: result.payload?.metadata || {},
        }));

        return {
            results,
            count: results.length,
            query,
        };

    } catch (error) {
        console.error('Error searching knowledge base:', error);
        return { error: 'Failed to search knowledge base' };
    }
}

/**
 * Get specific policy information
 */
export async function getPolicyInfo(category: string) {
    try {
        const policyList = await db
            .select()
            .from(policies)
            .where(and(eq(policies.category, category as any), eq(policies.isActive, true)))
            .orderBy(policies.priority);

        if (policyList.length === 0) {
            return { error: `No policies found for category: ${category}` };
        }

        return {
            category,
            policies: policyList.map((p) => ({
                title: p.title,
                content: p.content,
                effectiveDate: p.effectiveDate,
            })),
        };

    } catch (error) {
        console.error('Error getting policy:', error);
        return { error: 'Failed to retrieve policy information' };
    }
}

/**
 * Get restaurant information and menu
 */
export async function getRestaurantInfo(restaurantName?: string) {
    try {
        if (restaurantName) {
            // Get specific restaurant
            const restaurant = await db.query.restaurants.findFirst({
                where: and(
                    eq(restaurants.name, restaurantName),
                    eq(restaurants.isActive, true)
                ),
                with: {
                    menuItems: {
                        where: eq(menuItems.isAvailable, true),
                    },
                },
            });

            if (!restaurant) {
                return { error: `Restaurant "${restaurantName}" not found` };
            }

            return {
                name: restaurant.name,
                cuisineType: restaurant.cuisineType,
                description: restaurant.description,
                location: restaurant.location,
                operatingHours: restaurant.operatingHours,
                priceRange: restaurant.priceRange,
                reservationRequired: restaurant.reservationRequired,
                menu: restaurant.menuItems.map((item) => ({
                    name: item.name,
                    description: item.description,
                    price: parseFloat(item.price),
                    category: item.category,
                    dietaryInfo: item.dietaryInfo,
                })),
            };
        } else {
            // Get all restaurants
            const restaurantList = await db.query.restaurants.findMany({
                where: eq(restaurants.isActive, true),
                with: {
                    menuItems: {
                        where: eq(menuItems.isAvailable, true),
                        limit: 5, // Just show a few items
                    },
                },
            });

            return {
                restaurants: restaurantList.map((r) => ({
                    name: r.name,
                    cuisineType: r.cuisineType,
                    description: r.description,
                    location: r.location,
                    operatingHours: r.operatingHours,
                    priceRange: r.priceRange,
                    reservationRequired: r.reservationRequired,
                    sampleMenuItems: r.menuItems.slice(0, 3).map((item) => item.name),
                })),
            };
        }

    } catch (error) {
        console.error('Error getting restaurant info:', error);
        return { error: 'Failed to retrieve restaurant information' };
    }
}

/**
 * Get nearby attractions and activities
 */
export async function getNearbyAttractions(category?: string) {
    try {
        const conditions = [eq(nearbySpots.isActive, true)];

        if (category) {
            conditions.push(eq(nearbySpots.category, category));
        }

        const spots = await db
            .select()
            .from(nearbySpots)
            .where(and(...conditions));

        if (spots.length === 0) {
            return { error: 'No nearby attractions found' };
        }

        return {
            attractions: spots.map((spot) => ({
                name: spot.name,
                category: spot.category,
                description: spot.description,
                distance: spot.distance,
                travelTime: spot.estimatedTravelTime,
            })),
            count: spots.length,
        };

    } catch (error) {
        console.error('Error getting nearby attractions:', error);
        return { error: 'Failed to retrieve nearby attractions' };
    }
}

/**
 * Get hotel services
 */
export async function getHotelServices(category?: string) {
    try {
        const conditions = [eq(services.isActive, true)];

        if (category) {
            conditions.push(eq(services.category, category as any));
        }

        const serviceList = await db
            .select()
            .from(services)
            .where(and(...conditions));

        if (serviceList.length === 0) {
            return { error: 'No services found' };
        }

        return {
            services: serviceList.map((s) => ({
                name: s.name,
                category: s.category,
                description: s.description,
                price: s.price ? parseFloat(s.price) : null,
                operatingHours: s.operatingHours,
                bookingRequired: s.bookingRequired,
                contactExtension: s.contactExtension,
            })),
            count: serviceList.length,
        };

    } catch (error) {
        console.error('Error getting services:', error);
        return { error: 'Failed to retrieve hotel services' };
    }
}