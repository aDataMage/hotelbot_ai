/**
 * API CONTROLLER: Cancel Booking
 * 
 * FUNCTION: Handles POST request to cancel a specific booking.
 * Validates user ownership before allowing cancellation.
 */
import { NextResponse } from 'next/server';
import { getBookingService } from '@/app/api/dependencies';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id: confirmationNumber } = await params;
        const bookingService = getBookingService();

        // Get booking first to verify ownership
        const existingBooking = await bookingService.getBookingByConfirmationNumber(confirmationNumber);

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Verify user owns this booking
        if (existingBooking.guestEmail !== session.user.email) {
            return NextResponse.json(
                { error: 'You do not have permission to cancel this booking' },
                { status: 403 }
            );
        }

        // Check if booking can be cancelled
        if (!existingBooking.canBeCancelled()) {
            return NextResponse.json(
                { error: 'This booking cannot be cancelled. It may already be cancelled, completed, or past the check-in date.' },
                { status: 400 }
            );
        }

        // Calculate cancellation fee before cancelling
        const cancellationFee = existingBooking.calculateCancellationFee();
        const refundAmount = existingBooking.totalAmount - cancellationFee;

        // Perform cancellation
        const result = await bookingService.cancelBooking(confirmationNumber);

        return NextResponse.json({
            success: true,
            booking: result.booking.toObject(),
            cancellationFee: result.cancellationFee,
            refundAmount: result.refundAmount,
            message: cancellationFee > 0
                ? `Booking cancelled. A cancellation fee of $${cancellationFee.toFixed(2)} applies.`
                : 'Booking cancelled successfully. Full refund will be processed.'
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to cancel booking' },
            { status: 400 }
        );
    }
}
