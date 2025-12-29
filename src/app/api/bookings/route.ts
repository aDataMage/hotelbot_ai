/**
 * API CONTROLLER: Bookings
 * 
 * FUNCTION: Handles HTTP requests for booking resources (Create, Get).
 * Acts as an adapter translating HTTP requests to Domain Service calls.
 * 
 * RELATES TO:
 * - src/lib/domain/services/booking-service.ts (Service Invoked)
 * 
 * RELATED FILES:
 * - src/app/api/dependencies.ts (Dependency Injection)
 */
import { NextResponse } from 'next/server';
import { getBookingService } from '@/app/api/dependencies';

export async function POST(req: Request) {
    try {
        const bookingService = getBookingService();
        const body = await req.json();

        const booking = await bookingService.createBooking({
            roomId: body.roomId,
            checkInDate: new Date(body.checkInDate),
            checkOutDate: new Date(body.checkOutDate),
            guestName: body.guestName,
            guestEmail: body.guestEmail,
            guestPhone: body.guestPhone,
            numberOfGuests: body.numberOfGuests,
            specialRequests: body.specialRequests,
        });

        return NextResponse.json(booking.toObject(), { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create booking' },
            { status: 400 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter required' },
                { status: 400 }
            );
        }

        const bookingService = getBookingService();
        const bookings = await bookingService.getGuestBookings(email);

        return NextResponse.json({
            bookings: bookings.map(b => b.toObject()),
            count: bookings.length
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}