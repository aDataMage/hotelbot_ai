/**
 * FUNCTION: Core Domain Model
 * 
 * This file defines the `Booking` entity, representing a reservation in the system.
 * It contains business rules and data structure for bookings, independent of database or UI.
 * 
 * RELATES TO:
 * - src/lib/domain/models/room.ts (Related entity)
 * - src/lib/domain/value-objects/* (Building blocks)
 * 
 * RELATED FILES:
 * - src/lib/domain/repositories/booking-repository.ts (Interface using this model)
 * - src/lib/domain/services/booking-service.ts (Service managing this model)
 * - src/lib/infrastructure/database/schema.ts (DB representation)
 */
import { differenceInDays, isAfter, isBefore } from 'date-fns';

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
    COMPLETED = 'completed',
    NO_SHOW = 'no_show',
}

export interface BookingProps {
    id: string;
    confirmationNumber: string;
    roomId: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkInDate: Date;
    checkOutDate: Date;
    numberOfGuests: number;
    numberOfNights: number;
    roomRate: number;
    taxAmount: number;
    serviceCharge: number;
    totalAmount: number;
    status: BookingStatus;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Booking {
    private constructor(private props: BookingProps) { }

    static create(input: Omit<BookingProps, 'id' | 'confirmationNumber' | 'numberOfNights' | 'createdAt' | 'updatedAt'>): Booking {
        const checkIn = input.checkInDate;
        const checkOut = input.checkOutDate;

        if (!isAfter(checkOut, checkIn)) throw new Error('Check-out date must be after check-in date');
        const numberOfNights = differenceInDays(checkOut, checkIn);
        if (numberOfNights > 30) throw new Error('Maximum stay is 30 nights');
        if (numberOfNights < 1) throw new Error('Minimum stay is 1 night');
        if (!input.guestName.trim()) throw new Error('Guest name is required');
        if (!input.guestEmail.includes('@')) throw new Error('Valid email is required');
        if (input.numberOfGuests < 1) throw new Error('Number of guests must be at least 1');

        const confirmationNumber = `HT${Date.now().toString().slice(-8)}`;
        const now = new Date();

        return new Booking({
            ...input,
            id: crypto.randomUUID(),
            confirmationNumber,
            numberOfNights,
            createdAt: now,
            updatedAt: now,
        });
    }

    static reconstitute(props: BookingProps): Booking {
        return new Booking(props);
    }

    get id(): string { return this.props.id; }
    get confirmationNumber(): string { return this.props.confirmationNumber; }
    get roomId(): string { return this.props.roomId; }
    get guestName(): string { return this.props.guestName; }
    get guestEmail(): string { return this.props.guestEmail; }
    get guestPhone(): string { return this.props.guestPhone; }
    get checkInDate(): Date { return this.props.checkInDate; }
    get checkOutDate(): Date { return this.props.checkOutDate; }
    get numberOfGuests(): number { return this.props.numberOfGuests; }
    get numberOfNights(): number { return this.props.numberOfNights; }
    get roomRate(): number { return this.props.roomRate; }
    get taxAmount(): number { return this.props.taxAmount; }
    get serviceCharge(): number { return this.props.serviceCharge; }
    get totalAmount(): number { return this.props.totalAmount; }
    get status(): BookingStatus { return this.props.status; }
    get specialRequests(): string | undefined { return this.props.specialRequests; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    canBeCancelled(): boolean {
        if (this.props.status === BookingStatus.CANCELLED || this.props.status === BookingStatus.COMPLETED) return false;
        return isAfter(this.props.checkInDate, new Date());
    }

    cancel(): void {
        if (!this.canBeCancelled()) throw new Error('Booking cannot be cancelled');
        this.props.status = BookingStatus.CANCELLED;
        this.props.updatedAt = new Date();
    }

    confirm(): void {
        if (this.props.status !== BookingStatus.PENDING) throw new Error('Only pending bookings can be confirmed');
        this.props.status = BookingStatus.CONFIRMED;
        this.props.updatedAt = new Date();
    }

    complete(): void {
        if (this.props.status !== BookingStatus.CONFIRMED) throw new Error('Only confirmed bookings can be completed');
        if (isBefore(new Date(), this.props.checkOutDate)) throw new Error('Cannot complete booking before check-out date');
        this.props.status = BookingStatus.COMPLETED;
        this.props.updatedAt = new Date();
    }

    modifyDates(
        newCheckIn: Date,
        newCheckOut: Date,
        newPricing: {
            roomRate: number;
            taxAmount: number;
            serviceCharge: number;
            totalAmount: number;
        }
    ): void {
        if (this.props.status === BookingStatus.CANCELLED || this.props.status === BookingStatus.COMPLETED) {
            throw new Error('Cannot modify dates for cancelled or completed bookings');
        }

        if (!isAfter(newCheckOut, newCheckIn)) throw new Error('Check-out date must be after check-in date');
        const numberOfNights = differenceInDays(newCheckOut, newCheckIn);
        if (numberOfNights > 30) throw new Error('Maximum stay is 30 nights');
        if (numberOfNights < 1) throw new Error('Minimum stay is 1 night');

        this.props.checkInDate = newCheckIn;
        this.props.checkOutDate = newCheckOut;
        this.props.numberOfNights = numberOfNights;

        this.props.roomRate = newPricing.roomRate;
        this.props.taxAmount = newPricing.taxAmount;
        this.props.serviceCharge = newPricing.serviceCharge;
        this.props.totalAmount = newPricing.totalAmount;

        this.props.updatedAt = new Date();
    }

    calculateCancellationFee(): number {
        if (!this.canBeCancelled()) return this.props.totalAmount;
        const now = new Date();
        const hoursUntilCheckIn = differenceInDays(this.props.checkInDate, now) * 24;
        if (hoursUntilCheckIn > 48) return 0;
        if (hoursUntilCheckIn > 0) return this.props.roomRate + (this.props.roomRate * 0.15);
        return this.props.totalAmount;
    }

    conflictsWith(other: Booking): boolean {
        if (this.props.roomId !== other.roomId) return false;
        if (this.props.status === BookingStatus.CANCELLED || other.status === BookingStatus.CANCELLED) return false;
        return isBefore(this.props.checkInDate, other.checkOutDate) && isAfter(this.props.checkOutDate, other.checkInDate);
    }

    toObject(): BookingProps {
        return { ...this.props };
    }
}