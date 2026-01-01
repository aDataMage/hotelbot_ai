/**
 * INFRASTRUCTURE: AI Tool Implementations (Booking)
 * 
 * FUNCTION: Implements the logic for booking-related AI tools.
 * Bridging AI agents with Domain Services.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/langchain-tools.ts (Tool Wrappers)
 * - src/lib/domain/services/booking-service.ts (Domain Logic)
 * - src/lib/domain/services/room-service.ts (Domain Logic)
 */
import { parseISO, differenceInDays } from 'date-fns';
import { getRoomService, getBookingService } from '@/lib/infrastructure/di/container';
import { BedSize, ViewType } from '@/lib/domain/models/room';

export async function searchAvailableRooms(params: {
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    bedSize?: 'single' | 'double' | 'queen' | 'king';
    viewType?: 'ocean' | 'garden' | 'city' | 'pool';
    maxPrice?: number;
}) {
    try {
        console.log('🔍 searchAvailableRooms called with:', params);

        const checkIn = parseISO(params.checkInDate);
        const checkOut = parseISO(params.checkOutDate);

        console.log('📅 Parsed dates:', { checkIn, checkOut });

        if (checkOut <= checkIn) {
            return { error: 'Check-out date must be after check-in date' };
        }

        const nights = differenceInDays(checkOut, checkIn);
        if (nights > 30) return { error: 'Maximum stay is 30 nights' };
        if (nights < 1) return { error: 'Minimum stay is 1 night' };

        const roomService = getRoomService();
        const availableRooms = await roomService.findAvailableRoomsForDates(
            checkIn,
            checkOut,
            {
                bedSize: params.bedSize as BedSize | undefined,
                viewType: params.viewType as ViewType | undefined,
                maxPrice: params.maxPrice,
                minOccupancy: params.guests,
            }
        );

        console.log('🏨 Available rooms found:', availableRooms.length);

        if (availableRooms.length === 0) {
            return {
                message: 'No rooms available for the selected dates and criteria',
                suggestions: 'Try different dates or adjust your preferences',
            };
        }

        const roomsWithPricing = availableRooms.map((room) => {
            const pricing = roomService.calculateRoomPrice(room, nights);
            return {
                // IMPORTANT: Use this 'id' for createBooking, NOT roomNumber
                id: room.id,
                roomNumber: room.roomNumber,
                name: room.name,
                description: room.description,
                bedSize: room.bedSize,
                viewType: room.viewType,
                maxOccupancy: room.maxOccupancy,
                amenities: room.amenities,
                images: room.images,
                pricing,
            };
        });

        // Log the IDs for debugging
        console.log('🔍 searchRooms returning rooms:', roomsWithPricing.map(r => ({ id: r.id, name: r.name })));

        return {
            rooms: roomsWithPricing,
            count: roomsWithPricing.length,
            checkIn: params.checkInDate,
            checkOut: params.checkOutDate,
            nights,
        };
    } catch (error) {
        console.error('Error searching rooms:', error);
        return { error: 'Failed to search available rooms' };
    }
}

export async function createBooking(params: {
    roomId: string;
    checkInDate: string;
    checkOutDate: string;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    numberOfGuests: number;
    specialRequests?: string;
}) {
    try {
        console.log('📦 createBooking called with roomId:', params.roomId);

        const checkIn = parseISO(params.checkInDate);
        const checkOut = parseISO(params.checkOutDate);

        const bookingService = getBookingService();
        const roomService = getRoomService();

        const booking = await bookingService.createBooking({
            roomId: params.roomId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            guestName: params.guestName,
            guestEmail: params.guestEmail,
            guestPhone: params.guestPhone,
            numberOfGuests: params.numberOfGuests,
            specialRequests: params.specialRequests,
        });

        const room = await roomService.getRoomById(params.roomId);

        return {
            success: true,
            booking: {
                confirmationNumber: booking.confirmationNumber,
                roomName: room?.name,
                roomNumber: room?.roomNumber,
                checkIn: params.checkInDate,
                checkOut: params.checkOutDate,
                nights: booking.numberOfNights,
                guests: params.numberOfGuests,
                totalAmount: booking.totalAmount,
                guestEmail: params.guestEmail,
                status: booking.status,
            },
            message: `Booking confirmed! Your confirmation number is ${booking.confirmationNumber}. A confirmation email has been sent to ${params.guestEmail}.`,
        };
    } catch (error) {
        console.error('Error creating booking:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to create booking'
        };
    }
}

export async function getBookingDetails(confirmationNumber: string) {
    try {
        const bookingService = getBookingService();
        const roomService = getRoomService();

        const booking = await bookingService.getBookingByConfirmationNumber(confirmationNumber);
        if (!booking) return { error: 'Booking not found' };

        const room = await roomService.getRoomById(booking.roomId);

        return {
            confirmationNumber: booking.confirmationNumber,
            status: booking.status,
            room: {
                name: room?.name,
                roomNumber: room?.roomNumber,
                bedSize: room?.bedSize,
                viewType: room?.viewType,
            },
            checkIn: booking.checkInDate.toISOString().split('T')[0],
            checkOut: booking.checkOutDate.toISOString().split('T')[0],
            nights: booking.numberOfNights,
            guests: booking.numberOfGuests,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            pricing: {
                roomRate: booking.roomRate,
                tax: booking.taxAmount,
                serviceCharge: booking.serviceCharge,
                total: booking.totalAmount,
            },
            specialRequests: booking.specialRequests,
        };
    } catch (error) {
        console.error('Error getting booking details:', error);
        return { error: 'Failed to get booking details' };
    }
}

/**
 * Get all bookings for the authenticated user
 */
export async function getMyBookings(userEmail: string) {
    try {
        if (!userEmail) {
            return { error: 'You must be logged in to view your bookings' };
        }

        console.log('📋 getMyBookings called for:', userEmail);

        const bookingService = getBookingService();
        const roomService = getRoomService();

        const bookings = await bookingService.getGuestBookings(userEmail);

        if (bookings.length === 0) {
            return {
                message: 'You have no bookings yet.',
                bookings: []
            };
        }

        const bookingsWithDetails = await Promise.all(
            bookings.map(async (booking) => {
                const room = await roomService.getRoomById(booking.roomId);
                return {
                    confirmationNumber: booking.confirmationNumber,
                    status: booking.status,
                    roomName: room?.name,
                    roomNumber: room?.roomNumber,
                    checkIn: booking.checkInDate.toISOString().split('T')[0],
                    checkOut: booking.checkOutDate.toISOString().split('T')[0],
                    nights: booking.numberOfNights,
                    guests: booking.numberOfGuests,
                    totalAmount: booking.totalAmount,
                };
            })
        );

        return {
            bookings: bookingsWithDetails,
            count: bookingsWithDetails.length,
            message: `You have ${bookingsWithDetails.length} booking(s).`
        };
    } catch (error) {
        console.error('Error getting user bookings:', error);
        return { error: 'Failed to retrieve your bookings' };
    }
}

/**
 * Cancel a booking if it belongs to the authenticated user
 */
export async function cancelMyBooking(confirmationNumber: string, userEmail: string) {
    try {
        if (!userEmail) {
            return { error: 'You must be logged in to cancel bookings' };
        }

        console.log('❌ cancelMyBooking called:', { confirmationNumber, userEmail });

        const bookingService = getBookingService();

        // First verify the booking belongs to this user
        const booking = await bookingService.getBookingByConfirmationNumber(confirmationNumber);

        if (!booking) {
            return { error: 'Booking not found' };
        }

        if (booking.guestEmail.toLowerCase() !== userEmail.toLowerCase()) {
            return { error: 'You can only cancel your own bookings' };
        }

        if (!booking.canBeCancelled()) {
            return {
                error: 'This booking cannot be cancelled',
                reason: booking.status === 'cancelled' ? 'Already cancelled' : 'Check-in has passed'
            };
        }

        const result = await bookingService.cancelBooking(confirmationNumber);

        return {
            success: true,
            confirmationNumber: result.booking.confirmationNumber,
            cancellationFee: result.cancellationFee,
            refundAmount: result.refundAmount,
            message: `Booking ${confirmationNumber} has been cancelled. Refund amount: $${result.refundAmount.toFixed(2)}`
        };
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return { error: error instanceof Error ? error.message : 'Failed to cancel booking' };
    }
}