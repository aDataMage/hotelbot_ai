// src/lib/infrastructure/database/repositories/postgres-room-repository.ts

/**
 * INFRASTRUCTURE ADAPTER: PostgresRoomRepository
 * 
 * FUNCTION: Implementation of the Room Repository using PostgreSQL and Drizzle ORM.
 * This adapter bridges the Domain Port (IRoomRepository) with the actual database.
 * 
 * RELATES TO:
 * - src/lib/domain/repositories/room-repository.ts (Interface Implemented)
 * - src/lib/infrastructure/database/schema.ts (Database Schema)
 * 
 * RELATED FILES:
 * - src/lib/domain/models/room.ts (Domain Model returned)
 */

import { db } from '@/lib/infrastructure/database/drizzle';
import { rooms } from '@/lib/infrastructure/database/schema';
import { eq, and, lte, gte, sql } from 'drizzle-orm';
import { Room, BedSize, ViewType } from '@/lib/domain/models/room';
import { IRoomRepository, RoomSearchCriteria } from '@/lib/domain/repositories/room-repository';

export class PostgresRoomRepository implements IRoomRepository {
    async findById(id: string): Promise<Room | null> {
        const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.toDomain(result[0]);
    }

    async findByRoomNumber(roomNumber: string): Promise<Room | null> {
        const result = await db.select().from(rooms).where(eq(rooms.roomNumber, roomNumber)).limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.toDomain(result[0]);
    }

    async findAll(): Promise<Room[]> {
        const result = await db.select().from(rooms);
        return result.map(this.toDomain);
    }

    async search(criteria: RoomSearchCriteria): Promise<Room[]> {
        const conditions = [];

        if (criteria.roomId) {
            conditions.push(eq(rooms.id, criteria.roomId));
        }

        if (criteria.bedSize) {
            conditions.push(eq(rooms.bedSize, criteria.bedSize));
        }

        if (criteria.viewType) {
            conditions.push(eq(rooms.viewType, criteria.viewType));
        }

        if (criteria.maxPrice !== undefined) {
            conditions.push(lte(rooms.basePricePerNight, criteria.maxPrice.toString()));
        }

        if (criteria.minOccupancy !== undefined) {
            conditions.push(gte(rooms.maxOccupancy, criteria.minOccupancy));
        }

        if (criteria.isAvailable !== undefined) {
            conditions.push(eq(rooms.isAvailable, criteria.isAvailable));
        }

        const result = conditions.length > 0
            ? await db.select().from(rooms).where(and(...conditions))
            : await db.select().from(rooms);

        return result.map(this.toDomain);
    }

    async findAvailableForDates(
        checkIn: Date,
        checkOut: Date,
        criteria?: RoomSearchCriteria
    ): Promise<Room[]> {
        // For simplicity, just use search with criteria
        // Conflict checking is done at the service layer
        return this.search({ ...criteria, isAvailable: true });
    }

    async save(room: Room): Promise<Room> {
        const data = this.toPersistence(room);

        const result = await db
            .insert(rooms)
            .values(data)
            .onConflictDoUpdate({
                target: rooms.id,
                set: {
                    ...data,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return this.toDomain(result[0]);
    }

    async delete(id: string): Promise<void> {
        await db.delete(rooms).where(eq(rooms.id, id));
    }

    async existsByRoomNumber(roomNumber: string): Promise<boolean> {
        const result = await db
            .select({ id: rooms.id })
            .from(rooms)
            .where(eq(rooms.roomNumber, roomNumber))
            .limit(1);

        return result.length > 0;
    }

    // Mapping methods

    private toDomain(data: any): Room {
        return Room.reconstitute({
            id: data.id,
            roomNumber: data.roomNumber,
            name: data.name,
            description: data.description,
            bedSize: data.bedSize as BedSize,
            viewType: data.viewType as ViewType,
            basePricePerNight: parseFloat(data.basePricePerNight),
            maxOccupancy: data.maxOccupancy,
            amenities: data.amenities as string[],
            images: data.images as string[],
            isAvailable: data.isAvailable,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    private toPersistence(room: Room): any {
        const props = room.toObject();
        return {
            id: props.id,
            roomNumber: props.roomNumber,
            name: props.name,
            description: props.description,
            bedSize: props.bedSize,
            viewType: props.viewType,
            basePricePerNight: props.basePricePerNight.toString(),
            maxOccupancy: props.maxOccupancy,
            amenities: props.amenities,
            images: props.images,
            isAvailable: props.isAvailable,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}



