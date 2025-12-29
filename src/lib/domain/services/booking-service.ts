/**
 * FUNCTION: Domain Service
 * 
 * This file orchestrates booking operations such as creation, cancellation, and modification.
 * It enforces cross-aggregate business rules (e.g., checking room availability before booking).
 * 
 * RELATES TO:
 * - src/lib/domain/models/booking.ts (Entity)
 * - src/lib/domain/models/room.ts (Entity)
 * - src/lib/domain/repositories/booking-repository.ts (Port)
 * - src/lib/domain/repositories/room-repository.ts (Port)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/di/container.ts (Dependency Injection)
 * - src/app/api/dependencies.ts (Wiring)
 */
import { Booking, BookingStatus } from '../models/booking';
import { IBookingRepository } from '../repositories/booking-repository';
import { IRoomRepository } from '../repositories/room-repository';
import { differenceInDays } from 'date-fns';

export class BookingService {
    constructor(
        private bookingRepository: IBookingRepository,
        private roomRepository: IRoomRepository
    ) { }

    async createBooking(input: {
        roomId: string;
        checkInDate: Date;
        checkOutDate: Date;
        guestName: string;
        guestEmail: string;
        guestPhone: string;
        numberOfGuests: number;
        specialRequests?: string;
    }): Promise<Booking> {
        const room = await this.roomRepository.findById(input.roomId);
        if (!room) throw new Error('Room not found');
        if (!room.isAvailable) throw new Error('Room is not available');
        if (!room.canAccommodate(input.numberOfGuests)) {
            throw new Error(`Room can only accommodate up to ${room.maxOccupancy} guests`);
        }

        const conflicts = await this.bookingRepository.findConflicting(
            input.roomId,
            input.checkInDate,
            input.checkOutDate
        );
        if (conflicts.length > 0) throw new Error('Room is already booked for the selected dates');

        const nights = differenceInDays(input.checkOutDate, input.checkInDate);
        const pricing = room.calculatePrice(nights);

        const booking = Booking.create({
            roomId: input.roomId,
            guestName: input.guestName,
            guestEmail: input.guestEmail,
            guestPhone: input.guestPhone,
            checkInDate: input.checkInDate,
            checkOutDate: input.checkOutDate,
            numberOfGuests: input.numberOfGuests,
            roomRate: room.basePricePerNight,
            taxAmount: pricing.tax,
            serviceCharge: pricing.serviceCharge,
            totalAmount: pricing.total,
            status: BookingStatus.CONFIRMED,
            specialRequests: input.specialRequests,
        });

        return this.bookingRepository.save(booking);
    }

    async getBookingByConfirmationNumber(confirmationNumber: string): Promise<Booking | null> {
        return this.bookingRepository.findByConfirmationNumber(confirmationNumber);
    }

    async cancelBooking(confirmationNumber: string): Promise<{
        booking: Booking;
        cancellationFee: number;
        refundAmount: number;
    }> {
        const booking = await this.bookingRepository.findByConfirmationNumber(confirmationNumber);
        if (!booking) throw new Error('Booking not found');
        if (!booking.canBeCancelled()) throw new Error('Booking cannot be cancelled');

        const cancellationFee = booking.calculateCancellationFee();
        const refundAmount = booking.totalAmount - cancellationFee;

        booking.cancel();
        await this.bookingRepository.save(booking);

        return { booking, cancellationFee, refundAmount };
    }
    async modifyBookingDates(
        confirmationNumber: string,
        newCheckIn: Date,
        newCheckOut: Date
    ): Promise<Booking> {
        const booking = await this.bookingRepository.findByConfirmationNumber(confirmationNumber);
        if (!booking) throw new Error('Booking not found');

        const room = await this.roomRepository.findById(booking.roomId);
        if (!room) throw new Error('Room not found');

        // Check availability excluding this booking
        const conflicts = await this.bookingRepository.findConflicting(
            booking.roomId,
            newCheckIn,
            newCheckOut,
            booking.id
        );
        if (conflicts.length > 0) throw new Error('Room is not available for the selected dates');

        // Calculate new price
        const nights = differenceInDays(newCheckOut, newCheckIn);
        const pricing = room.calculatePrice(nights);

        // Update booking
        booking.modifyDates(newCheckIn, newCheckOut, {
            roomRate: room.basePricePerNight,
            taxAmount: pricing.tax,
            serviceCharge: pricing.serviceCharge,
            totalAmount: pricing.total,
        });

        return this.bookingRepository.save(booking);
    }
}