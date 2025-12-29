import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic imports are used in main() to ensure env vars are loaded first
// import { db } from '../src/lib/infrastructure/database/drizzle';
// import { rooms, services, policies } from '../src/lib/infrastructure/database/schema';
// import { initQdrant } from '../src/lib/infrastructure/vector/qdrant-client';

const ROOMS_DATA = [
    {
        roomNumber: '101',
        name: 'Ocean Breeze Suite',
        description: 'Luxurious suite with panoramic ocean views, private balcony, and modern amenities.',
        bedSize: 'king' as const,
        viewType: 'ocean' as const,
        basePricePerNight: '350.00',
        maxOccupancy: 2,
        amenities: ['wifi', 'smart-tv', 'minibar', 'balcony', 'ocean-view', 'bathtub'],
        images: ['/rooms/ocean-breeze-1.jpg'],
        isAvailable: true,
    },
    {
        roomNumber: '102',
        name: 'Garden View Deluxe',
        description: 'Peaceful room overlooking tropical gardens with queen bed.',
        bedSize: 'queen' as const,
        viewType: 'garden' as const,
        basePricePerNight: '220.00',
        maxOccupancy: 2,
        amenities: ['wifi', 'smart-tv', 'minibar', 'garden-view'],
        images: ['/rooms/garden-deluxe-1.jpg'],
        isAvailable: true,
    },
    {
        roomNumber: '201',
        name: 'Executive Ocean Suite',
        description: 'Spacious suite with separate living area, king bed, and stunning ocean panorama.',
        bedSize: 'king' as const,
        viewType: 'ocean' as const,
        basePricePerNight: '550.00',
        maxOccupancy: 4,
        amenities: ['wifi', 'smart-tv', 'minibar', 'balcony', 'ocean-view', 'living-room', 'kitchenette'],
        images: ['/rooms/executive-suite-1.jpg'],
        isAvailable: true,
    },
];

const SERVICES_DATA = [
    {
        name: 'Azure Spa & Wellness',
        category: 'spa' as const,
        description: 'Full-service spa offering massages, facials, and wellness packages.',
        price: '120.00',
        operatingHours: '9:00 AM - 8:00 PM daily',
        bookingRequired: true,
        contactExtension: 'ext. 500',
        isActive: true,
    },
    {
        name: 'Infinity Pool & Cabanas',
        category: 'recreation' as const,
        description: 'Rooftop infinity pool with ocean views and private cabanas.',
        price: null,
        operatingHours: '6:00 AM - 10:00 PM',
        bookingRequired: false,
        contactExtension: null,
        isActive: true,
    },
];

const POLICIES_DATA = [
    {
        category: 'check-in' as const,
        title: 'Check-in and Check-out Times',
        content: `Check-in: 3:00 PM\nCheck-out: 11:00 AM\nEarly check-in subject to availability\nLate check-out available for $50`,
        priority: 1,
        isActive: true,
    },
    {
        category: 'cancellation' as const,
        title: 'Cancellation Policy',
        content: `Free cancellation up to 48 hours before check-in\nCancellations within 48 hours: charged 1 night\nNo-shows: charged full amount`,
        priority: 2,
        isActive: true,
    },
];

async function main() {
    console.log('🌱 Seeding database...');

    const { db } = await import('../src/lib/infrastructure/database/drizzle');
    const { rooms, services, policies } = await import('../src/lib/infrastructure/database/schema');
    const { initQdrant } = await import('../src/lib/infrastructure/vector/qdrant-client');

    try {
        // Seed rooms
        console.log('  📦 Seeding rooms...');
        await db.insert(rooms).values(ROOMS_DATA);
        console.log('  ✓ Rooms seeded');

        // Seed services
        console.log('  📦 Seeding services...');
        await db.insert(services).values(SERVICES_DATA);
        console.log('  ✓ Services seeded');

        // Seed policies
        console.log('  📦 Seeding policies...');
        await db.insert(policies).values(POLICIES_DATA);
        console.log('  ✓ Policies seeded');

        // Initialize Qdrant
        console.log('  🔍 Initializing vector database...');
        await initQdrant();
        console.log('  ✓ Vector DB initialized');

        console.log('✅ Seeding complete!');
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