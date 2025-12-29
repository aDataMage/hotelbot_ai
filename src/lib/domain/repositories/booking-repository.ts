/**
 * FUNCTION: Repository Interface (Port)
 * 
 * This file defines the contract for accessing booking data.
 * It allows the domain layer to remain agnostic of the underlying database technology.
 * 
 * RELATES TO:
 * - src/lib/domain/models/booking.ts (Entity)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/database/repositories/postgres-booking-repository.ts (Implementation)
 * - src/lib/domain/services/booking-service.ts (Consumer)
 */
import { Booking, BookingStatus } from '@/lib/domain/models/booking';

export interface BookingSearchCriteria {
    guestEmail?: string;
    roomId?: string;
    status?: BookingStatus;
    checkInDateFrom?: Date;
    checkInDateTo?: Date;
}

export interface IBookingRepository {
    findById(id: string): Promise<Booking | null>;
    findByConfirmationNumber(confirmationNumber: string): Promise<Booking | null>;
    findByGuestEmail(email: string): Promise<Booking[]>;
    search(criteria: BookingSearchCriteria): Promise<Booking[]>;
    findConflicting(roomId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<Booking[]>;
    save(booking: Booking): Promise<Booking>;
    delete(id: string): Promise<void>;
    existsByConfirmationNumber(confirmationNumber: string): Promise<boolean>;
}