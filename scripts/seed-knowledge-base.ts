import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

/**
 * Seed Knowledge Base Script
 * 
 * Populates the database with services, restaurants, nearby spots, and policies.
 * Mirrors the Python seed script template from the original hotel_chat_bot project.
 * 
 * Run with: npx tsx scripts/seed-knowledge-base.ts
 */

// =============================================================================
// SERVICES DATA
// =============================================================================

const SERVICES_DATA = [
    {
        name: 'Azure Spa & Wellness',
        category: 'spa' as const,
        description: 'Full-service spa offering massages, facials, body treatments, and wellness packages.',
        price: '120.00',
        operatingHours: '9:00 AM - 8:00 PM daily',
        bookingRequired: true,
        contactExtension: 'ext. 500',
        isActive: true,
    },
    {
        name: 'Infinity Pool & Cabanas',
        category: 'recreation' as const,
        description: 'Rooftop infinity pool with ocean views, private cabanas, and poolside bar service.',
        price: null,
        operatingHours: '6:00 AM - 10:00 PM',
        bookingRequired: false,
        contactExtension: null,
        isActive: true,
    },
    {
        name: 'Concierge Services',
        category: 'concierge' as const,
        description: '24/7 concierge for tour bookings, restaurant reservations, transportation, and local recommendations.',
        price: null,
        operatingHours: '24/7',
        bookingRequired: false,
        contactExtension: 'ext. 0',
        isActive: true,
    },
    {
        name: 'Fitness Center',
        category: 'recreation' as const,
        description: 'State-of-the-art gym with cardio equipment, weights, yoga studio, and personal training.',
        price: null,
        operatingHours: '24/7',
        bookingRequired: false,
        contactExtension: null,
        isActive: true,
    },
    {
        name: 'Airport Shuttle',
        category: 'transport' as const,
        description: 'Comfortable shuttle service to and from the airport. Advance booking recommended.',
        price: '45.00',
        operatingHours: '5:00 AM - 11:00 PM',
        bookingRequired: true,
        contactExtension: 'ext. 100',
        isActive: true,
    },
    {
        name: 'Business Center',
        category: 'concierge' as const,
        description: 'Fully equipped business center with printing, meeting rooms, and high-speed internet.',
        price: null,
        operatingHours: '24/7',
        bookingRequired: false,
        contactExtension: 'ext. 150',
        isActive: true,
    },
    {
        name: 'Room Service',
        category: 'dining' as const,
        description: '24-hour in-room dining with a diverse menu of local and international dishes.',
        price: null,
        operatingHours: '24/7',
        bookingRequired: false,
        contactExtension: 'ext. 200',
        isActive: true,
    },
    {
        name: 'Valet Parking',
        category: 'transport' as const,
        description: 'Secure valet parking service for all hotel guests. Self-parking also available.',
        price: '25.00',
        operatingHours: '24/7',
        bookingRequired: false,
        contactExtension: null,
        isActive: true,
    },
    {
        name: 'Kids Club',
        category: 'recreation' as const,
        description: 'Supervised kids activities including games, crafts, and educational programs. Ages 4-12.',
        price: '30.00',
        operatingHours: '9:00 AM - 6:00 PM',
        bookingRequired: true,
        contactExtension: 'ext. 350',
        isActive: true,
    },
    {
        name: 'Tennis & Sports Courts',
        category: 'recreation' as const,
        description: 'Professional tennis courts, basketball court, and equipment rental available.',
        price: '50.00',
        operatingHours: '6:00 AM - 9:00 PM',
        bookingRequired: true,
        contactExtension: 'ext. 360',
        isActive: true,
    },
];

// =============================================================================
// RESTAURANTS DATA
// =============================================================================

const RESTAURANTS_DATA = [
    {
        name: 'Horizon Restaurant',
        cuisineType: 'International Fine Dining',
        description: 'Signature restaurant featuring contemporary international cuisine with panoramic ocean views. Perfect for romantic dinners and special occasions.',
        location: 'Ground Floor, Ocean Wing',
        operatingHours: '6:30 AM - 10:30 PM',
        priceRange: '$$$',
        reservationRequired: true,
        isActive: true,
    },
    {
        name: 'Breeze Cafe',
        cuisineType: 'Casual Dining & Coffee',
        description: 'All-day cafe serving breakfast, light meals, artisan pastries, and specialty coffee. Great for casual meetings.',
        location: 'Lobby Level',
        operatingHours: '6:00 AM - 6:00 PM',
        priceRange: '$$',
        reservationRequired: false,
        isActive: true,
    },
    {
        name: 'Sunset Bar & Grill',
        cuisineType: 'Poolside Casual',
        description: 'Relaxed poolside dining with grilled favorites, tropical cocktails, and refreshments. Live music on weekends.',
        location: 'Pool Deck',
        operatingHours: '11:00 AM - 9:00 PM',
        priceRange: '$$',
        reservationRequired: false,
        isActive: true,
    },
    {
        name: 'Sakura',
        cuisineType: 'Japanese',
        description: 'Authentic Japanese cuisine featuring sushi, sashimi, teppanyaki, and traditional kaiseki meals.',
        location: 'Second Floor, Garden Wing',
        operatingHours: '12:00 PM - 10:00 PM',
        priceRange: '$$$',
        reservationRequired: true,
        isActive: true,
    },
    {
        name: 'La Terrazza',
        cuisineType: 'Italian',
        description: 'Romantic Italian restaurant with handmade pasta, wood-fired pizzas, and an extensive wine list.',
        location: 'Rooftop',
        operatingHours: '6:00 PM - 11:00 PM',
        priceRange: '$$$',
        reservationRequired: true,
        isActive: true,
    },
];

// Menu items will be linked to restaurants after insertion
const MENU_ITEMS_BY_RESTAURANT: Record<string, Array<{
    name: string;
    description: string;
    price: string;
    category: string;
    dietaryInfo: string[];
}>> = {
    'Horizon Restaurant': [
        {
            name: 'Grilled Atlantic Salmon',
            description: 'Pan-seared salmon with lemon butter, seasonal vegetables, and herb risotto',
            price: '42.00',
            category: 'main',
            dietaryInfo: ['gluten-free-option'],
        },
        {
            name: 'Wagyu Beef Tenderloin',
            description: '8oz tenderloin with truffle mashed potatoes, asparagus, and red wine reduction',
            price: '68.00',
            category: 'main',
            dietaryInfo: [],
        },
        {
            name: 'Mediterranean Mezze Platter',
            description: 'Hummus, baba ganoush, falafel, olives, and warm pita',
            price: '24.00',
            category: 'appetizer',
            dietaryInfo: ['vegetarian', 'vegan-option'],
        },
        {
            name: 'Chocolate Lava Cake',
            description: 'Warm molten chocolate cake with vanilla ice cream and berry coulis',
            price: '14.00',
            category: 'dessert',
            dietaryInfo: ['vegetarian'],
        },
        {
            name: 'Lobster Bisque',
            description: 'Creamy lobster soup with cognac and fresh herbs',
            price: '18.00',
            category: 'appetizer',
            dietaryInfo: [],
        },
    ],
    'Breeze Cafe': [
        {
            name: 'Avocado Toast',
            description: 'Smashed avocado on sourdough with poached eggs, cherry tomatoes, and feta',
            price: '16.00',
            category: 'main',
            dietaryInfo: ['vegetarian'],
        },
        {
            name: 'Acai Bowl',
            description: 'Organic acai topped with granola, fresh berries, banana, and honey',
            price: '13.00',
            category: 'main',
            dietaryInfo: ['vegan', 'gluten-free'],
        },
        {
            name: 'Flat White',
            description: 'Double shot espresso with microfoam milk',
            price: '5.50',
            category: 'beverage',
            dietaryInfo: ['vegetarian'],
        },
        {
            name: 'Fresh Fruit Smoothie',
            description: 'Blend of seasonal fruits with yogurt and honey',
            price: '8.00',
            category: 'beverage',
            dietaryInfo: ['vegetarian', 'gluten-free'],
        },
        {
            name: 'Club Sandwich',
            description: 'Triple-decker with chicken, bacon, lettuce, tomato, and mayo',
            price: '18.00',
            category: 'main',
            dietaryInfo: [],
        },
    ],
    'Sunset Bar & Grill': [
        {
            name: 'Classic Burger',
            description: 'Angus beef patty with lettuce, tomato, cheese, and house special sauce',
            price: '18.00',
            category: 'main',
            dietaryInfo: [],
        },
        {
            name: 'Fish Tacos',
            description: 'Grilled mahi-mahi tacos with cabbage slaw and chipotle mayo',
            price: '16.00',
            category: 'main',
            dietaryInfo: ['gluten-free-option'],
        },
        {
            name: 'Tropical Cocktail',
            description: 'Signature rum cocktail with pineapple, coconut, and lime',
            price: '14.00',
            category: 'beverage',
            dietaryInfo: ['vegan'],
        },
        {
            name: 'Grilled Chicken Wings',
            description: 'Crispy wings with choice of BBQ, buffalo, or honey garlic sauce',
            price: '15.00',
            category: 'appetizer',
            dietaryInfo: ['gluten-free'],
        },
    ],
    'Sakura': [
        {
            name: 'Omakase Sushi Set',
            description: 'Chef\'s selection of 12 premium sushi pieces with miso soup',
            price: '85.00',
            category: 'main',
            dietaryInfo: ['gluten-free-option'],
        },
        {
            name: 'Wagyu Teppanyaki',
            description: 'A5 Wagyu beef prepared tableside with seasonal vegetables',
            price: '120.00',
            category: 'main',
            dietaryInfo: ['gluten-free'],
        },
        {
            name: 'Edamame',
            description: 'Steamed soybeans with sea salt',
            price: '8.00',
            category: 'appetizer',
            dietaryInfo: ['vegan', 'gluten-free'],
        },
        {
            name: 'Matcha Ice Cream',
            description: 'Premium green tea ice cream with red bean paste',
            price: '12.00',
            category: 'dessert',
            dietaryInfo: ['vegetarian'],
        },
    ],
    'La Terrazza': [
        {
            name: 'Truffle Risotto',
            description: 'Creamy arborio rice with black truffle and parmesan',
            price: '38.00',
            category: 'main',
            dietaryInfo: ['vegetarian', 'gluten-free'],
        },
        {
            name: 'Margherita Pizza',
            description: 'Traditional pizza with San Marzano tomatoes, mozzarella, and fresh basil',
            price: '22.00',
            category: 'main',
            dietaryInfo: ['vegetarian'],
        },
        {
            name: 'Tiramisu',
            description: 'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone',
            price: '14.00',
            category: 'dessert',
            dietaryInfo: ['vegetarian'],
        },
        {
            name: 'Burrata Caprese',
            description: 'Fresh burrata with heirloom tomatoes, basil oil, and aged balsamic',
            price: '18.00',
            category: 'appetizer',
            dietaryInfo: ['vegetarian', 'gluten-free'],
        },
    ],
};

// =============================================================================
// NEARBY SPOTS DATA
// =============================================================================

const NEARBY_SPOTS_DATA = [
    {
        name: 'Paradise Beach',
        category: 'beach',
        description: 'Pristine white sand beach with crystal clear waters, perfect for swimming, snorkeling, and sunbathing.',
        distance: '5-minute walk',
        estimatedTravelTime: '5 mins walking',
        isActive: true,
    },
    {
        name: 'Coral Reef Marine Park',
        category: 'attraction',
        description: 'Protected marine reserve offering snorkeling, diving, and glass-bottom boat tours. Home to diverse marine life.',
        distance: '2.5 km',
        estimatedTravelTime: '10 mins by car',
        isActive: true,
    },
    {
        name: 'Old Town Market',
        category: 'shopping',
        description: 'Historic marketplace with local crafts, fresh produce, authentic street food, and souvenirs.',
        distance: '4 km',
        estimatedTravelTime: '15 mins by car',
        isActive: true,
    },
    {
        name: 'Sunset Point Viewpoint',
        category: 'attraction',
        description: 'Clifftop viewpoint offering breathtaking sunset views and photo opportunities. Popular for proposals!',
        distance: '6 km',
        estimatedTravelTime: '20 mins by car',
        isActive: true,
    },
    {
        name: 'Marina District',
        category: 'dining-shopping',
        description: 'Waterfront area with yacht harbor, upscale restaurants, bars, and boutique shops.',
        distance: '3 km',
        estimatedTravelTime: '12 mins by car',
        isActive: true,
    },
    {
        name: 'Tropical Rainforest Reserve',
        category: 'attraction',
        description: 'Guided nature trails through lush rainforest with exotic birds, waterfalls, and zip-lining adventures.',
        distance: '15 km',
        estimatedTravelTime: '30 mins by car',
        isActive: true,
    },
    {
        name: 'Golf & Country Club',
        category: 'recreation',
        description: '18-hole championship golf course with pro shop and clubhouse restaurant. Tee times available.',
        distance: '8 km',
        estimatedTravelTime: '20 mins by car',
        isActive: true,
    },
    {
        name: 'Adventure Sports Center',
        category: 'recreation',
        description: 'Jet ski rentals, parasailing, kayaking, and paddleboarding. Equipment and lessons available.',
        distance: '1 km',
        estimatedTravelTime: '3 mins by car or 15 mins walking',
        isActive: true,
    },
    {
        name: 'Historic Lighthouse',
        category: 'attraction',
        description: '19th-century lighthouse with museum and panoramic views from the observation deck.',
        distance: '7 km',
        estimatedTravelTime: '18 mins by car',
        isActive: true,
    },
    {
        name: 'Night Market & Food Street',
        category: 'dining-shopping',
        description: 'Vibrant night market with local delicacies, street performances, and handmade crafts. Opens 6PM.',
        distance: '5 km',
        estimatedTravelTime: '15 mins by car',
        isActive: true,
    },
];

// =============================================================================
// POLICIES DATA
// =============================================================================

const POLICIES_DATA = [
    {
        category: 'check-in' as const,
        title: 'Check-in and Check-out Times',
        content: `- Check-in time: 3:00 PM
- Check-out time: 11:00 AM
- Early check-in subject to availability (contact us in advance)
- Late check-out available for additional fee ($50 until 2:00 PM)
- Valid government-issued ID and credit card required at check-in
- Express check-in available for returning guests`,
        priority: 1,
        isActive: true,
    },
    {
        category: 'cancellation' as const,
        title: 'Cancellation and Modification Policy',
        content: `- Free cancellation up to 48 hours before check-in date
- Cancellations within 48 hours: charged 1 night room rate
- No-shows: charged full reservation amount
- Modifications subject to availability and rate changes
- Non-refundable rates cannot be cancelled or modified
- Group bookings (5+ rooms) have separate cancellation terms`,
        priority: 2,
        isActive: true,
    },
    {
        category: 'payment' as const,
        title: 'Payment and Deposit Policy',
        content: `- Credit card required to secure reservation
- We accept Visa, Mastercard, American Express, Discover
- Pre-authorization hold placed 24 hours before arrival
- Full payment due at check-out
- City tax (10%) and service charge (5%) added to room rate
- Incidental deposit of $100 per night (released within 7 business days after checkout)`,
        priority: 3,
        isActive: true,
    },
    {
        category: 'pets' as const,
        title: 'Pet Policy',
        content: `- Pet-friendly hotel (dogs and cats only)
- Maximum 2 pets per room
- Pet fee: $50 per night per pet
- Weight limit: 25 lbs per pet
- Pets must be leashed in public areas
- Additional cleaning fee if damage occurs
- Service animals welcome at no charge with valid documentation
- Pet-sitting services available upon request`,
        priority: 4,
        isActive: true,
    },
    {
        category: 'amenities' as const,
        title: 'Hotel Amenities and Services',
        content: `- Complimentary high-speed WiFi throughout property
- Free parking for registered guests
- 24-hour room service available
- Daily housekeeping included
- Turndown service upon request
- Laundry and dry cleaning services (same-day if before 9AM)
- Airport shuttle (surcharge applies, advance booking required)
- Business center with printing services
- In-room safe for valuables`,
        priority: 5,
        isActive: true,
    },
    {
        category: 'smoking' as const,
        title: 'Smoking Policy',
        content: `- All indoor areas are 100% non-smoking
- Designated smoking areas available outside
- Smoking in rooms results in $250 cleaning fee
- Vaping follows same policy as smoking
- Cannabis products prohibited on property`,
        priority: 6,
        isActive: true,
    },
    {
        category: 'general' as const,
        title: 'General House Rules',
        content: `- Quiet hours: 10:00 PM - 7:00 AM
- Maximum room occupancy must be respected
- No outside food or beverages in restaurant areas
- Pool hours: 6:00 AM - 10:00 PM
- Children under 16 must be supervised at pool
- Lost and found items kept for 30 days
- Management reserves right to refuse service`,
        priority: 7,
        isActive: true,
    },
];

// =============================================================================
// MAIN SEEDING FUNCTION
// =============================================================================

async function main() {
    console.log('='.repeat(60));
    console.log('HotelAI Knowledge Base Seeding');
    console.log('='.repeat(60));

    const { db } = await import('../src/lib/infrastructure/database/drizzle');
    const { services, restaurants, menuItems, nearbySpots, policies } = await import('../src/lib/infrastructure/database/schema');

    try {
        // Seed Services
        console.log(`\n📦 Seeding ${SERVICES_DATA.length} services...`);
        await db.insert(services).values(SERVICES_DATA);
        console.log('   ✓ Services seeded');

        // Seed Restaurants
        console.log(`\n📦 Seeding ${RESTAURANTS_DATA.length} restaurants...`);
        const insertedRestaurants = await db.insert(restaurants).values(RESTAURANTS_DATA).returning();
        console.log('   ✓ Restaurants seeded');

        // Seed Menu Items (linked to restaurants)
        console.log('\n📦 Seeding menu items...');
        let menuItemCount = 0;
        for (const restaurant of insertedRestaurants) {
            const items = MENU_ITEMS_BY_RESTAURANT[restaurant.name];
            if (items && items.length > 0) {
                const menuData = items.map(item => ({
                    restaurantId: restaurant.id,
                    ...item,
                    isAvailable: true,
                }));
                await db.insert(menuItems).values(menuData);
                menuItemCount += items.length;
                console.log(`   ✓ ${items.length} items for ${restaurant.name}`);
            }
        }
        console.log(`   ✓ Total ${menuItemCount} menu items seeded`);

        // Seed Nearby Spots
        console.log(`\n📦 Seeding ${NEARBY_SPOTS_DATA.length} nearby spots...`);
        await db.insert(nearbySpots).values(NEARBY_SPOTS_DATA);
        console.log('   ✓ Nearby spots seeded');

        // Seed Policies
        console.log(`\n📦 Seeding ${POLICIES_DATA.length} policies...`);
        await db.insert(policies).values(POLICIES_DATA);
        console.log('   ✓ Policies seeded');

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ Knowledge Base Seeding Complete!');
        console.log('='.repeat(60));
        console.log('\nSummary:');
        console.log(`   - Services: ${SERVICES_DATA.length}`);
        console.log(`   - Restaurants: ${RESTAURANTS_DATA.length}`);
        console.log(`   - Menu Items: ${menuItemCount}`);
        console.log(`   - Nearby Spots: ${NEARBY_SPOTS_DATA.length}`);
        console.log(`   - Policies: ${POLICIES_DATA.length}`);
        console.log('\n' + '='.repeat(60));

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
