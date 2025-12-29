// src/lib/infrastructure/database/repositories/postgres-booking-repository.ts

/**
 * INFRASTRUCTURE ADAPTER: PostgresBookingRepository
 * 
 * FUNCTION: Implementation of the Booking Repository using PostgreSQL and Drizzle ORM.
 * This adapter bridges the Domain Port (IBookingRepository) with the actual database.
 * 
 * RELATES TO:
 * - src/lib/domain/repositories/booking-repository.ts (Interface Implemented)
 * - src/lib/infrastructure/database/schema.ts (Database Schema)
 * 
 * RELATED FILES:
 * - src/lib/domain/models/booking.ts (Domain Model returned)
 */

import { db } from '@/lib/infrastructure/database/drizzle';
import { bookings } from '@/lib/infrastructure/database/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { Booking, BookingStatus } from '@/lib/domain/models/booking';
import { IBookingRepository, BookingSearchCriteria } from '@/lib/domain/repositories/booking-repository';

export class PostgresBookingRepository implements IBookingRepository {
    async findById(id: string): Promise<Booking | null> {
        const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.toDomain(result[0]);
    }

    async findByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
        const result = await db
            .select()
            .from(bookings)
            .where(eq(bookings.confirmationNumber, confirmationNumber))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        return this.toDomain(result[0]);
    }

    async findByGuestEmail(email: string): Promise<Booking[]> {
        const result = await db.select().from(bookings).where(eq(bookings.guestEmail, email));

        return result.map(this.toDomain);
    }

    async search(criteria: BookingSearchCriteria): Promise<Booking[]> {
        const conditions = [];

        if (criteria.guestEmail) {
            conditions.push(eq(bookings.guestEmail, criteria.guestEmail));
        }

        if (criteria.roomId) {
            conditions.push(eq(bookings.roomId, criteria.roomId));
        }

        if (criteria.status) {
            conditions.push(eq(bookings.status, criteria.status));
        }

        if (criteria.checkInDateFrom) {
            conditions.push(gte(bookings.checkInDate, criteria.checkInDateFrom));
        }

        if (criteria.checkInDateTo) {
            conditions.push(lte(bookings.checkInDate, criteria.checkInDateTo));
        }

        const result = conditions.length > 0
            ? await db.select().from(bookings).where(and(...conditions))
            : await db.select().from(bookings);

        return result.map(this.toDomain);
    }

    async findConflicting(
        roomId: string,
        checkIn: Date,
        checkOut: Date,
        excludeBookingId?: string
    ): Promise<Booking[]> {
        // Format dates as ISO strings for PostgreSQL
        const checkInStr = checkIn.toISOString();
        const checkOutStr = checkOut.toISOString();

        const conditions = [
            eq(bookings.roomId, roomId),
            sql`${bookings.checkInDate} < ${checkOutStr}`,
            sql`${bookings.checkOutDate} > ${checkInStr}`,
            sql`${bookings.status} != 'cancelled'`,
        ];

        if (excludeBookingId) {
            conditions.push(sql`${bookings.id} != ${excludeBookingId}`);
        }

        const result = await db.select().from(bookings).where(and(...conditions));

        return result.map(this.toDomain);
    }

    async save(booking: Booking): Promise<Booking> {
        const data = this.toPersistence(booking);

        const result = await db
            .insert(bookings)
            .values(data)
            .onConflictDoUpdate({
                target: bookings.id,
                set: {
                    ...data,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return this.toDomain(result[0]);
    }

    async delete(id: string): Promise<void> {
        await db.delete(bookings).where(eq(bookings.id, id));
    }

    async existsByConfirmationNumber(confirmationNumber: string): Promise<boolean> {
        const result = await db
            .select({ id: bookings.id })
            .from(bookings)
            .where(eq(bookings.confirmationNumber, confirmationNumber))
            .limit(1);

        return result.length > 0;
    }

    // Mapping methods

    private toDomain(data: any): Booking {
        return Booking.reconstitute({
            id: data.id,
            confirmationNumber: data.confirmationNumber,
            roomId: data.roomId,
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            guestPhone: data.guestPhone,
            checkInDate: data.checkInDate,
            checkOutDate: data.checkOutDate,
            numberOfGuests: data.numberOfGuests,
            numberOfNights: data.numberOfNights,
            roomRate: parseFloat(data.roomRate),
            taxAmount: parseFloat(data.taxAmount),
            serviceCharge: parseFloat(data.serviceCharge),
            totalAmount: parseFloat(data.totalAmount),
            status: data.status as BookingStatus,
            specialRequests: data.specialRequests,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    private toPersistence(booking: Booking): any {
        const props = booking.toObject();
        return {
            id: props.id,
            confirmationNumber: props.confirmationNumber,
            roomId: props.roomId,
            guestName: props.guestName,
            guestEmail: props.guestEmail,
            guestPhone: props.guestPhone,
            checkInDate: props.checkInDate,
            checkOutDate: props.checkOutDate,
            numberOfGuests: props.numberOfGuests,
            numberOfNights: props.numberOfNights,
            roomRate: props.roomRate.toString(),
            taxAmount: props.taxAmount.toString(),
            serviceCharge: props.serviceCharge.toString(),
            totalAmount: props.totalAmount.toString(),
            status: props.status,
            specialRequests: props.specialRequests,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}