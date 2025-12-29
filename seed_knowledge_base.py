"""
Seed Knowledge Base Script

Populates the database and vector store with initial hotel data
for development and testing purposes.
"""

import asyncio
import uuid
from decimal import Decimal

# Import domain models
from src.domain.models import (
    BedSize,
    HotelService,
    MenuItem,
    NearbySpot,
    Policy,
    Restaurant,
    Room,
    ServiceCategory,
    ViewType,
)


def generate_id() -> str:
    """Generate a unique ID."""
    return str(uuid.uuid4())


# =============================================================================
# ROOM DATA
# =============================================================================

ROOMS_DATA = [
    Room(
        id=generate_id(),
        room_number="101",
        name="Ocean Breeze Suite",
        description="Luxurious suite with panoramic ocean views, private balcony, and modern amenities.",
        bed_size=BedSize.KING,
        view_type=ViewType.OCEAN,
        base_price_per_night=Decimal("350.00"),
        max_occupancy=2,
        amenities=[
            "wifi",
            "smart-tv",
            "minibar",
            "balcony",
            "ocean-view",
            "bathtub",
            "coffee-maker",
        ],
        images=["/rooms/ocean-breeze-1.jpg", "/rooms/ocean-breeze-2.jpg"],
    ),
    Room(
        id=generate_id(),
        room_number="102",
        name="Garden View Deluxe",
        description="Peaceful room overlooking tropical gardens with queen bed and workspace.",
        bed_size=BedSize.QUEEN,
        view_type=ViewType.GARDEN,
        base_price_per_night=Decimal("220.00"),
        max_occupancy=2,
        amenities=["wifi", "smart-tv", "minibar", "workspace", "garden-view", "rain-shower"],
        images=["/rooms/garden-deluxe-1.jpg"],
    ),
    Room(
        id=generate_id(),
        room_number="201",
        name="Executive Ocean Suite",
        description="Spacious suite with separate living area, king bed, and stunning ocean panorama.",
        bed_size=BedSize.KING,
        view_type=ViewType.OCEAN,
        base_price_per_night=Decimal("550.00"),
        max_occupancy=4,
        amenities=[
            "wifi",
            "smart-tv",
            "minibar",
            "balcony",
            "ocean-view",
            "bathtub",
            "living-room",
            "kitchenette",
        ],
        images=["/rooms/executive-suite-1.jpg", "/rooms/executive-suite-2.jpg"],
    ),
    Room(
        id=generate_id(),
        room_number="105",
        name="Pool View Standard",
        description="Comfortable room with pool view and double bed, perfect for solo travelers or couples.",
        bed_size=BedSize.DOUBLE,
        view_type=ViewType.POOL,
        base_price_per_night=Decimal("180.00"),
        max_occupancy=2,
        amenities=["wifi", "tv", "pool-view", "rain-shower", "safe"],
        images=["/rooms/pool-standard-1.jpg"],
    ),
    Room(
        id=generate_id(),
        room_number="301",
        name="Presidential Suite",
        description="Ultimate luxury with private terrace, panoramic views, butler service, and premium amenities.",
        bed_size=BedSize.KING,
        view_type=ViewType.OCEAN,
        base_price_per_night=Decimal("1200.00"),
        max_occupancy=6,
        amenities=[
            "wifi",
            "smart-tv",
            "minibar",
            "terrace",
            "ocean-view",
            "jacuzzi",
            "living-room",
            "dining-room",
            "butler-service",
        ],
        images=["/rooms/presidential-1.jpg", "/rooms/presidential-2.jpg"],
    ),
]


# =============================================================================
# SERVICES DATA
# =============================================================================

SERVICES_DATA = [
    HotelService(
        id=generate_id(),
        name="Azure Spa & Wellness",
        category=ServiceCategory.SPA,
        description="Full-service spa offering massages, facials, body treatments, and wellness packages.",
        price=Decimal("120.00"),
        operating_hours="9:00 AM - 8:00 PM daily",
        booking_required=True,
        contact_extension="ext. 500",
    ),
    HotelService(
        id=generate_id(),
        name="Infinity Pool & Cabanas",
        category=ServiceCategory.RECREATION,
        description="Rooftop infinity pool with ocean views, private cabanas, and poolside bar service.",
        price=None,
        operating_hours="6:00 AM - 10:00 PM",
        booking_required=False,
        contact_extension=None,
    ),
    HotelService(
        id=generate_id(),
        name="Concierge Services",
        category=ServiceCategory.CONCIERGE,
        description="24/7 concierge for tour bookings, restaurant reservations, transportation, and local recommendations.",
        price=None,
        operating_hours="24/7",
        booking_required=False,
        contact_extension="ext. 0",
    ),
    HotelService(
        id=generate_id(),
        name="Fitness Center",
        category=ServiceCategory.RECREATION,
        description="State-of-the-art gym with cardio equipment, weights, and yoga studio.",
        price=None,
        operating_hours="24/7",
        booking_required=False,
        contact_extension=None,
    ),
    HotelService(
        id=generate_id(),
        name="Airport Shuttle",
        category=ServiceCategory.TRANSPORT,
        description="Comfortable shuttle service to and from the airport. Advance booking recommended.",
        price=Decimal("45.00"),
        operating_hours="5:00 AM - 11:00 PM",
        booking_required=True,
        contact_extension="ext. 100",
    ),
    HotelService(
        id=generate_id(),
        name="Business Center",
        category=ServiceCategory.BUSINESS,
        description="Fully equipped business center with printing, meeting rooms, and high-speed internet.",
        price=None,
        operating_hours="24/7",
        booking_required=False,
        contact_extension="ext. 150",
    ),
]


# =============================================================================
# RESTAURANT DATA
# =============================================================================

RESTAURANTS_DATA = [
    Restaurant(
        id=generate_id(),
        name="Horizon Restaurant",
        cuisine_type="International Fine Dining",
        description="Signature restaurant featuring contemporary international cuisine with ocean views.",
        location="on-site (Ground Floor)",
        operating_hours="6:30 AM - 10:30 PM",
        price_range="$$$",
        reservation_required=True,
        menu_items=[
            MenuItem(
                id=generate_id(),
                name="Grilled Atlantic Salmon",
                description="Pan-seared salmon with lemon butter, seasonal vegetables, and herb risotto",
                price=Decimal("42.00"),
                category="main",
                dietary_info=["gluten-free-option"],
            ),
            MenuItem(
                id=generate_id(),
                name="Wagyu Beef Tenderloin",
                description="8oz tenderloin with truffle mashed potatoes, asparagus, and red wine reduction",
                price=Decimal("68.00"),
                category="main",
                dietary_info=[],
            ),
            MenuItem(
                id=generate_id(),
                name="Mediterranean Mezze Platter",
                description="Hummus, baba ganoush, falafel, olives, and warm pita",
                price=Decimal("24.00"),
                category="appetizer",
                dietary_info=["vegetarian", "vegan-option"],
            ),
            MenuItem(
                id=generate_id(),
                name="Chocolate Lava Cake",
                description="Warm molten chocolate cake with vanilla ice cream and berry coulis",
                price=Decimal("14.00"),
                category="dessert",
                dietary_info=["vegetarian"],
            ),
        ],
    ),
    Restaurant(
        id=generate_id(),
        name="Breeze Cafe",
        cuisine_type="Casual Dining & Coffee",
        description="All-day cafe serving breakfast, light meals, pastries, and specialty coffee.",
        location="on-site (Lobby Level)",
        operating_hours="6:00 AM - 6:00 PM",
        price_range="$$",
        reservation_required=False,
        menu_items=[
            MenuItem(
                id=generate_id(),
                name="Avocado Toast",
                description="Smashed avocado on sourdough with poached eggs, cherry tomatoes, and feta",
                price=Decimal("16.00"),
                category="main",
                dietary_info=["vegetarian"],
            ),
            MenuItem(
                id=generate_id(),
                name="Acai Bowl",
                description="Organic acai topped with granola, fresh berries, banana, and honey",
                price=Decimal("13.00"),
                category="main",
                dietary_info=["vegan", "gluten-free"],
            ),
            MenuItem(
                id=generate_id(),
                name="Flat White",
                description="Double shot espresso with microfoam milk",
                price=Decimal("5.50"),
                category="beverage",
                dietary_info=["vegetarian"],
            ),
        ],
    ),
    Restaurant(
        id=generate_id(),
        name="Sunset Bar & Grill",
        cuisine_type="Poolside Casual",
        description="Relaxed poolside dining with grilled favorites, cocktails, and refreshments.",
        location="on-site (Pool Deck)",
        operating_hours="11:00 AM - 9:00 PM",
        price_range="$$",
        reservation_required=False,
        menu_items=[
            MenuItem(
                id=generate_id(),
                name="Classic Burger",
                description="Angus beef patty with lettuce, tomato, cheese, and house special sauce",
                price=Decimal("18.00"),
                category="main",
                dietary_info=[],
            ),
            MenuItem(
                id=generate_id(),
                name="Fish Tacos",
                description="Grilled mahi-mahi tacos with cabbage slaw and chipotle mayo",
                price=Decimal("16.00"),
                category="main",
                dietary_info=["gluten-free-option"],
            ),
        ],
    ),
]


# =============================================================================
# NEARBY SPOTS DATA
# =============================================================================

NEARBY_SPOTS_DATA = [
    NearbySpot(
        id=generate_id(),
        name="Paradise Beach",
        category="beach",
        description="Pristine white sand beach with crystal clear waters, perfect for swimming and snorkeling.",
        distance="5-minute walk",
        estimated_travel_time="5 mins walking",
    ),
    NearbySpot(
        id=generate_id(),
        name="Coral Reef Marine Park",
        category="attraction",
        description="Protected marine reserve offering snorkeling, diving, and glass-bottom boat tours.",
        distance="2.5 km",
        estimated_travel_time="10 mins by car",
    ),
    NearbySpot(
        id=generate_id(),
        name="Old Town Market",
        category="shopping",
        description="Historic marketplace with local crafts, fresh produce, and authentic street food.",
        distance="4 km",
        estimated_travel_time="15 mins by car",
    ),
    NearbySpot(
        id=generate_id(),
        name="Sunset Point Viewpoint",
        category="attraction",
        description="Clifftop viewpoint offering breathtaking sunset views and photo opportunities.",
        distance="6 km",
        estimated_travel_time="20 mins by car",
    ),
    NearbySpot(
        id=generate_id(),
        name="Marina District",
        category="dining-shopping",
        description="Waterfront area with yacht harbor, upscale restaurants, bars, and boutique shops.",
        distance="3 km",
        estimated_travel_time="12 mins by car",
    ),
]


# =============================================================================
# POLICIES DATA
# =============================================================================

POLICIES_DATA = [
    Policy(
        id=generate_id(),
        category="check-in",
        title="Check-in and Check-out Times",
        content="""
- Check-in time: 3:00 PM
- Check-out time: 11:00 AM
- Early check-in subject to availability (contact us in advance)
- Late check-out available for additional fee ($50 until 2:00 PM)
- Valid government-issued ID and credit card required at check-in
        """.strip(),
        priority=1,
    ),
    Policy(
        id=generate_id(),
        category="cancellation",
        title="Cancellation and Modification Policy",
        content="""
- Free cancellation up to 48 hours before check-in date
- Cancellations within 48 hours: charged 1 night room rate
- No-shows: charged full reservation amount
- Modifications subject to availability and rate changes
- Non-refundable rates cannot be cancelled or modified
        """.strip(),
        priority=2,
    ),
    Policy(
        id=generate_id(),
        category="payment",
        title="Payment and Deposit Policy",
        content="""
- Credit card required to secure reservation
- We accept Visa, Mastercard, American Express
- Pre-authorization hold placed 24 hours before arrival
- Full payment due at check-out
- City tax (10%) and service charge (5%) added to room rate
- Incidental deposit of $100 per night (released after checkout)
        """.strip(),
        priority=3,
    ),
    Policy(
        id=generate_id(),
        category="pets",
        title="Pet Policy",
        content="""
- Pet-friendly hotel (dogs and cats only)
- Maximum 2 pets per room
- Pet fee: $50 per night per pet
- Weight limit: 25 lbs per pet
- Pets must be leashed in public areas
- Additional cleaning fee if damage occurs
- Service animals welcome at no charge
        """.strip(),
        priority=4,
    ),
    Policy(
        id=generate_id(),
        category="amenities",
        title="Hotel Amenities and Services",
        content="""
- Complimentary WiFi throughout property
- Free parking for registered guests
- 24-hour room service available
- Daily housekeeping included
- Laundry and dry cleaning services
- Airport shuttle (surcharge applies)
- Business center with printing services
        """.strip(),
        priority=5,
    ),
    Policy(
        id=generate_id(),
        category="smoking",
        title="Smoking Policy",
        content="""
- All indoor areas are non-smoking
- Designated smoking areas available outside
- Smoking in rooms results in $250 cleaning fee
- Vaping follows same policy as smoking
        """.strip(),
        priority=6,
    ),
]


async def main() -> None:
    """
    Main seeding function.

    Seeds PostgreSQL and Qdrant with hotel data.
    """
    print("=" * 60)
    print("HotelAI Knowledge Base Seeding")
    print("=" * 60)

    # Initialize database tables
    from src.infrastructure.database import create_tables, get_postgres_room_repository
    from src.infrastructure.vector import get_qdrant_repository

    print("\nInitializing database...")
    await create_tables()
    print("Database tables ready")

    # Seed Rooms
    print(f"\nSeeding {len(ROOMS_DATA)} rooms to PostgreSQL...")
    room_repo = get_postgres_room_repository()

    for room in ROOMS_DATA:
        try:
            await room_repo.save(room)
            print(f"   [OK] {room.room_number}: {room.name}")
        except Exception as e:
            print(f"   [FAIL] {room.room_number}: {e}")

    # Seed Policies to Qdrant
    print(f"\nSeeding {len(POLICIES_DATA)} policies to Qdrant...")
    vector_repo = get_qdrant_repository()

    # Create collection if not exists
    collection_name = "hotel_policies"
    if not await vector_repo.collection_exists(collection_name):
        await vector_repo.create_collection(collection_name)
        print(f"   [OK] Created collection: {collection_name}")

    # Batch upsert policies
    policy_docs = [
        {
            "id": policy.id,
            "content": f"{policy.title}\n\n{policy.content}",
            "metadata": {
                "category": policy.category,
                "title": policy.title,
                "priority": policy.priority,
            },
        }
        for policy in POLICIES_DATA
    ]

    count = await vector_repo.upsert_batch(collection_name, policy_docs)
    print(f"   [OK] Seeded {count} policies to vector store")

    # Summary
    print("\n" + "=" * 60)
    print("Knowledge Base Seeding Complete!")
    print("=" * 60)
    print(f"\nSummary:")
    print(f"   - Rooms: {len(ROOMS_DATA)}")
    print(f"   - Policies (vector): {len(POLICIES_DATA)}")
    print(f"\nServices and Restaurants data defined but not yet persisted")
    print(f"   (awaiting additional repository implementations)")
    print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
