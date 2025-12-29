/**
 * INFRASTRUCTURE: Database Schema
 * 
 * FUNCTION: Defines the database tables, enums, and relations using Drizzle ORM.
 * This is the source of truth for the physical data model.
 * 
 * RELATES TO:
 * - src/lib/domain/models/* (Domain entities mapped to these tables)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/database/repositories/* (Repositories using this schema)
 */
// src/lib/infrastructure/database/schema.ts
import {
    pgTable,
    varchar,
    text,
    decimal,
    integer,
    boolean,
    timestamp,
    jsonb,
    pgEnum,
    index,
    uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// =============================================================================
// ENUMS
// =============================================================================

export const bedSizeEnum = pgEnum('bed_size', [
    'single',
    'double',
    'queen',
    'king'
]);

export const viewTypeEnum = pgEnum('view_type', [
    'ocean',
    'garden',
    'city',
    'pool'
]);

export const bookingStatusEnum = pgEnum('booking_status', [
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'no_show'
]);

export const serviceCategoryEnum = pgEnum('service_category', [
    'spa',
    'dining',
    'recreation',
    'concierge',
    'transport'
]);

export const policyCategoryEnum = pgEnum('policy_category', [
    'check-in',
    'cancellation',
    'payment',
    'pets',
    'amenities',
    'smoking',
    'general'
]);

// =============================================================================
// TABLES
// =============================================================================

// -----------------------------------------------------------------------------
// Rooms Table
// -----------------------------------------------------------------------------
export const rooms = pgTable('rooms', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    roomNumber: varchar('room_number', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    bedSize: bedSizeEnum('bed_size').notNull(),
    viewType: viewTypeEnum('view_type').notNull(),
    basePricePerNight: decimal('base_price_per_night', { precision: 10, scale: 2 }).notNull(),
    maxOccupancy: integer('max_occupancy').notNull().default(2),
    amenities: jsonb('amenities').notNull().$type<string[]>().default([]),
    images: jsonb('images').notNull().$type<string[]>().default([]),
    isAvailable: boolean('is_available').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    roomNumberIdx: uniqueIndex('room_number_idx').on(table.roomNumber),
    bedSizeIdx: index('bed_size_idx').on(table.bedSize),
    viewTypeIdx: index('view_type_idx').on(table.viewType),
    availabilityIdx: index('availability_idx').on(table.isAvailable),
}));

// -----------------------------------------------------------------------------
// Bookings Table
// -----------------------------------------------------------------------------
export const bookings = pgTable('bookings', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    confirmationNumber: varchar('confirmation_number', { length: 20 }).notNull().unique(),
    roomId: varchar('room_id', { length: 128 }).notNull().references(() => rooms.id),

    // Guest information
    guestName: varchar('guest_name', { length: 255 }).notNull(),
    guestEmail: varchar('guest_email', { length: 255 }).notNull(),
    guestPhone: varchar('guest_phone', { length: 50 }).notNull(),

    // Booking details
    checkInDate: timestamp('check_in_date', { withTimezone: true }).notNull(),
    checkOutDate: timestamp('check_out_date', { withTimezone: true }).notNull(),
    numberOfGuests: integer('number_of_guests').notNull(),
    numberOfNights: integer('number_of_nights').notNull(),

    // Pricing
    roomRate: decimal('room_rate', { precision: 10, scale: 2 }).notNull(),
    taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull(),
    serviceCharge: decimal('service_charge', { precision: 10, scale: 2 }).notNull(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),

    // Status
    status: bookingStatusEnum('status').notNull().default('pending'),

    // Special requests
    specialRequests: text('special_requests'),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    confirmationIdx: uniqueIndex('confirmation_number_idx').on(table.confirmationNumber),
    roomIdIdx: index('booking_room_id_idx').on(table.roomId),
    guestEmailIdx: index('guest_email_idx').on(table.guestEmail),
    statusIdx: index('booking_status_idx').on(table.status),
    datesIdx: index('booking_dates_idx').on(table.checkInDate, table.checkOutDate),
}));

// -----------------------------------------------------------------------------
// Services Table
// -----------------------------------------------------------------------------
export const services = pgTable('services', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    category: serviceCategoryEnum('category').notNull(),
    description: text('description').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }),
    operatingHours: varchar('operating_hours', { length: 255 }).notNull(),
    bookingRequired: boolean('booking_required').notNull().default(false),
    contactExtension: varchar('contact_extension', { length: 20 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    categoryIdx: index('service_category_idx').on(table.category),
    activeIdx: index('service_active_idx').on(table.isActive),
}));

// -----------------------------------------------------------------------------
// Restaurants Table
// -----------------------------------------------------------------------------
export const restaurants = pgTable('restaurants', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    cuisineType: varchar('cuisine_type', { length: 100 }).notNull(),
    description: text('description').notNull(),
    location: varchar('location', { length: 255 }).notNull(),
    operatingHours: varchar('operating_hours', { length: 255 }).notNull(),
    priceRange: varchar('price_range', { length: 10 }).notNull(), // $, $$, $$$
    reservationRequired: boolean('reservation_required').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    cuisineIdx: index('restaurant_cuisine_idx').on(table.cuisineType),
    activeIdx: index('restaurant_active_idx').on(table.isActive),
}));

// -----------------------------------------------------------------------------
// Menu Items Table
// -----------------------------------------------------------------------------
export const menuItems = pgTable('menu_items', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    restaurantId: varchar('restaurant_id', { length: 128 }).notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    category: varchar('category', { length: 50 }).notNull(), // appetizer, main, dessert, beverage
    dietaryInfo: jsonb('dietary_info').$type<string[]>().default([]),
    isAvailable: boolean('is_available').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    restaurantIdx: index('menu_restaurant_idx').on(table.restaurantId),
    categoryIdx: index('menu_category_idx').on(table.category),
    availableIdx: index('menu_available_idx').on(table.isAvailable),
}));

// -----------------------------------------------------------------------------
// Policies Table
// -----------------------------------------------------------------------------
export const policies = pgTable('policies', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    category: policyCategoryEnum('category').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    priority: integer('priority').notNull().default(0),
    effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull().defaultNow(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    categoryIdx: index('policy_category_idx').on(table.category),
    priorityIdx: index('policy_priority_idx').on(table.priority),
    activeIdx: index('policy_active_idx').on(table.isActive),
}));

// -----------------------------------------------------------------------------
// Nearby Spots Table
// -----------------------------------------------------------------------------
export const nearbySpots = pgTable('nearby_spots', {
    id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
    name: varchar('name', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }).notNull(), // beach, attraction, shopping, dining
    description: text('description').notNull(),
    distance: varchar('distance', { length: 50 }).notNull(),
    estimatedTravelTime: varchar('estimated_travel_time', { length: 50 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
    categoryIdx: index('spot_category_idx').on(table.category),
    activeIdx: index('spot_active_idx').on(table.isActive),
}));

// =============================================================================
// RELATIONS
// =============================================================================

export const roomsRelations = relations(rooms, ({ many }) => ({
    bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
    room: one(rooms, {
        fields: [bookings.roomId],
        references: [rooms.id],
    }),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
    menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
    restaurant: one(restaurants, {
        fields: [menuItems.restaurantId],
        references: [restaurants.id],
    }),
}));

// =============================================================================
// TYPES (Inferred from schema)
// =============================================================================

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type Restaurant = typeof restaurants.$inferSelect;
export type NewRestaurant = typeof restaurants.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type Policy = typeof policies.$inferSelect;
export type NewPolicy = typeof policies.$inferInsert;

export type NearbySpot = typeof nearbySpots.$inferSelect;
export type NewNearbySpot = typeof nearbySpots.$inferInsert;