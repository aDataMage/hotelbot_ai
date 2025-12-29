import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Seed Qdrant Vector Database Script
 * 
 * Creates the hotel_knowledge collection and populates it with embeddings
 * from policies, services, restaurants, and nearby spots.
 * 
 * Run with: npx tsx scripts/seed-qdrant.ts
 */

import { QdrantClient } from '@qdrant/qdrant-js';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'hotel_knowledge';
const VECTOR_SIZE = 1536; // OpenAI text-embedding-3-small dimension
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI();

/**
 * Generate embeddings using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
    const result = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
    });
    return result.data[0].embedding;
}

/**
 * Knowledge items to embed
 */
const KNOWLEDGE_ITEMS = [
    // Policies
    {
        id: randomUUID(),
        category: 'policy',
        title: 'Check-in and Check-out Times',
        content: `Check-in time is 3:00 PM. Check-out time is 11:00 AM. Early check-in is subject to availability. Late check-out available for $50 until 2:00 PM. Valid government-issued ID and credit card required at check-in.`,
    },
    {
        id: randomUUID(),
        category: 'policy',
        title: 'Cancellation Policy',
        content: `Free cancellation up to 48 hours before check-in date. Cancellations within 48 hours are charged 1 night room rate. No-shows are charged full reservation amount. Non-refundable rates cannot be cancelled or modified.`,
    },
    {
        id: randomUUID(),
        category: 'policy',
        title: 'Payment Policy',
        content: `We accept Visa, Mastercard, American Express, and Discover. Credit card required to secure reservation. City tax (10%) and service charge (5%) added to room rate. Incidental deposit of $100 per night released within 7 business days after checkout.`,
    },
    {
        id: randomUUID(),
        category: 'policy',
        title: 'Pet Policy',
        content: `We are a pet-friendly hotel for dogs and cats only. Maximum 2 pets per room. Pet fee is $50 per night per pet. Weight limit 25 lbs per pet. Pets must be leashed in public areas. Service animals welcome at no charge with valid documentation.`,
    },
    {
        id: randomUUID(),
        category: 'policy',
        title: 'Smoking Policy',
        content: `All indoor areas are 100% non-smoking. Designated smoking areas available outside. Smoking in rooms results in $250 cleaning fee. Vaping follows same policy as smoking. Cannabis products prohibited on property.`,
    },
    // Services
    {
        id: randomUUID(),
        category: 'service',
        title: 'Spa Services',
        content: `Azure Spa & Wellness offers full-service spa including massages, facials, and body treatments. Open 9:00 AM - 8:00 PM daily. Prices start at $120. Booking required. Contact ext. 500.`,
    },
    {
        id: randomUUID(),
        category: 'service',
        title: 'Pool and Recreation',
        content: `Rooftop infinity pool with ocean views, private cabanas, and poolside bar service. Open 6:00 AM - 10:00 PM. Complimentary for hotel guests. Fitness center open 24/7 with cardio equipment, weights, and yoga studio.`,
    },
    {
        id: randomUUID(),
        category: 'service',
        title: 'Transportation Services',
        content: `Airport shuttle available from 5:00 AM - 11:00 PM for $45 per person. Advance booking recommended. Valet parking available 24/7 for $25 per day. Self-parking also available for hotel guests.`,
    },
    {
        id: randomUUID(),
        category: 'service',
        title: 'Room Service',
        content: `24-hour in-room dining available with diverse menu of local and international dishes. Contact ext. 200 to order. Laundry and dry cleaning services available with same-day service if submitted before 9:00 AM.`,
    },
    {
        id: randomUUID(),
        category: 'service',
        title: 'Concierge Services',
        content: `24/7 concierge for tour bookings, restaurant reservations, transportation arrangements, and local recommendations. Contact ext. 0 or visit the lobby desk.`,
    },
    // Restaurants
    {
        id: randomUUID(),
        category: 'restaurant',
        title: 'Horizon Restaurant',
        content: `Signature fine dining restaurant featuring contemporary international cuisine with panoramic ocean views. Open 6:30 AM - 10:30 PM. Price range $$$. Reservations required. Located on Ground Floor, Ocean Wing. Popular dishes include Wagyu Beef Tenderloin ($68), Grilled Atlantic Salmon ($42), and Chocolate Lava Cake ($14).`,
    },
    {
        id: randomUUID(),
        category: 'restaurant',
        title: 'Breeze Cafe',
        content: `All-day cafe serving breakfast, light meals, artisan pastries, and specialty coffee. Open 6:00 AM - 6:00 PM. Price range $$. No reservation needed. Located at Lobby Level. Popular items include Avocado Toast ($16), Acai Bowl ($13), and Flat White ($5.50).`,
    },
    {
        id: randomUUID(),
        category: 'restaurant',
        title: 'Sunset Bar & Grill',
        content: `Relaxed poolside dining with grilled favorites, tropical cocktails, and refreshments. Live music on weekends. Open 11:00 AM - 9:00 PM. Price range $$. No reservation needed. Located at Pool Deck. Popular items include Classic Burger ($18), Fish Tacos ($16), and Tropical Cocktail ($14).`,
    },
    {
        id: randomUUID(),
        category: 'restaurant',
        title: 'Sakura Japanese Restaurant',
        content: `Authentic Japanese cuisine featuring sushi, sashimi, teppanyaki, and traditional kaiseki meals. Open 12:00 PM - 10:00 PM. Price range $$$. Reservations required. Located on Second Floor, Garden Wing. Popular dishes include Omakase Sushi Set ($85) and Wagyu Teppanyaki ($120).`,
    },
    {
        id: randomUUID(),
        category: 'restaurant',
        title: 'La Terrazza Italian Restaurant',
        content: `Romantic Italian restaurant with handmade pasta, wood-fired pizzas, and extensive wine list. Open 6:00 PM - 11:00 PM. Price range $$$. Reservations required. Located at Rooftop. Popular dishes include Truffle Risotto ($38), Margherita Pizza ($22), and Tiramisu ($14).`,
    },
    // Nearby Attractions
    {
        id: randomUUID(),
        category: 'nearby',
        title: 'Paradise Beach',
        content: `Pristine white sand beach with crystal clear waters, perfect for swimming, snorkeling, and sunbathing. Just a 5-minute walk from the hotel.`,
    },
    {
        id: randomUUID(),
        category: 'nearby',
        title: 'Coral Reef Marine Park',
        content: `Protected marine reserve offering snorkeling, diving, and glass-bottom boat tours. Home to diverse marine life. Located 2.5 km away, approximately 10 minutes by car.`,
    },
    {
        id: randomUUID(),
        category: 'nearby',
        title: 'Old Town Market',
        content: `Historic marketplace with local crafts, fresh produce, authentic street food, and souvenirs. Located 4 km away, approximately 15 minutes by car.`,
    },
    {
        id: randomUUID(),
        category: 'nearby',
        title: 'Marina District',
        content: `Waterfront area with yacht harbor, upscale restaurants, bars, and boutique shops. Located 3 km away, approximately 12 minutes by car.`,
    },
    {
        id: randomUUID(),
        category: 'nearby',
        title: 'Adventure Activities',
        content: `Adventure Sports Center offers jet ski rentals, parasailing, kayaking, and paddleboarding. Equipment and lessons available. Located 1 km away, 3 minutes by car or 15 minutes walking.`,
    },
];

async function main() {
    console.log('='.repeat(60));
    console.log('Qdrant Vector Database Seeding');
    console.log('='.repeat(60));

    try {
        // Check if collection exists
        console.log('\n📦 Checking Qdrant collection...');
        const collections = await qdrant.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

        if (exists) {
            console.log('   ⚠ Collection exists, deleting to recreate...');
            await qdrant.deleteCollection(COLLECTION_NAME);
        }

        // Create collection
        console.log('   🔧 Creating collection...');
        await qdrant.createCollection(COLLECTION_NAME, {
            vectors: {
                size: VECTOR_SIZE,
                distance: 'Cosine',
            },
        });
        console.log('   ✓ Collection created');

        // Generate embeddings and upsert points
        console.log(`\n📦 Embedding ${KNOWLEDGE_ITEMS.length} knowledge items...`);
        const points = [];

        for (let i = 0; i < KNOWLEDGE_ITEMS.length; i++) {
            const item = KNOWLEDGE_ITEMS[i];
            const textToEmbed = `${item.title}\n\n${item.content}`;

            console.log(`   [${i + 1}/${KNOWLEDGE_ITEMS.length}] ${item.title}`);
            const embedding = await generateEmbedding(textToEmbed);

            points.push({
                id: item.id,
                vector: embedding,
                payload: {
                    title: item.title,
                    content: item.content,
                    category: item.category,
                },
            });

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Upsert all points
        console.log('\n📦 Upserting to Qdrant...');
        await qdrant.upsert(COLLECTION_NAME, {
            wait: true,
            points,
        });
        console.log('   ✓ All points upserted');

        // Verify
        const info = await qdrant.getCollection(COLLECTION_NAME);
        console.log(`\n✅ Collection "${COLLECTION_NAME}" now has ${info.points_count} vectors`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Qdrant Seeding Complete!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => process.exit(0));
