"use client";

/**
 * COMPONENT: Booking Actions
 * 
 * FUNCTION: Client component for interactive booking card with cancel functionality.
 */
import { useState } from "react";
import { format, differenceInHours, isPast } from "date-fns";
import {
    Calendar,
    Users,
    X,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Clock,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingData {
    id: string;
    confirmationNumber: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    numberOfNights: number;
    totalAmount: number;
    status: string;
    room?: {
        name: string;
        roomNumber: string;
    } | null;
}

interface BookingActionsProps {
    booking: BookingData;
    onCancelled?: () => void;
}

export function BookingActions({ booking, onCancelled }: BookingActionsProps) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);
    const hoursUntilCheckIn = differenceInHours(checkInDate, new Date());
    const canCancel = booking.status === 'confirmed' && !isPast(checkInDate);

    // Calculate cancellation fee preview
    const getCancellationInfo = () => {
        if (hoursUntilCheckIn > 48) {
            return { fee: 0, message: "Free cancellation available" };
        } else if (hoursUntilCheckIn > 0) {
            const fee = (booking.totalAmount / booking.numberOfNights) * 1.15; // 1 night + 15%
            return {
                fee,
                message: `Cancellation fee: $${fee.toFixed(2)} (1 night + 15%)`
            };
        }
        return { fee: booking.totalAmount, message: "No refund available" };
    };

    const cancellationInfo = getCancellationInfo();

    const handleCancel = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/bookings/${booking.confirmationNumber}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel booking');
            }

            setSuccess(true);
            setTimeout(() => {
                setShowCancelModal(false);
                onCancelled?.();
                // Force page refresh to update booking list
                window.location.reload();
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        } finally {
            setIsLoading(false);
        }
    };

    // Status badge styling
    const getStatusBadge = () => {
        const styles: Record<string, string> = {
            confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        };
        return styles[booking.status] || styles.pending;
    };

    return (
        <>
            <div className={cn(
                "rounded-2xl overflow-hidden transition-all duration-200",
                "bg-[var(--surface)] border border-[var(--border)]",
                "hover:shadow-lg group"
            )}>
                <div className="flex flex-col md:flex-row">
                    {/* Date Section */}
                    <div className="bg-[var(--surface-dim)] p-6 md:w-48 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-[var(--border)]">
                        <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs uppercase tracking-wider mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Check-in
                        </div>
                        <p className="text-xl font-bold text-[var(--foreground)]">
                            {format(checkInDate, "MMM d")}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                            {format(checkInDate, "yyyy")}
                        </p>

                        <div className="w-8 h-px bg-[var(--border)] my-3" />

                        <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs uppercase tracking-wider mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Check-out
                        </div>
                        <p className="text-xl font-bold text-[var(--foreground)]">
                            {format(checkOutDate, "MMM d")}
                        </p>
                        <p className="text-sm text-[var(--muted)]">
                            {format(checkOutDate, "yyyy")}
                        </p>
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                    {booking.room?.name || "Room"}
                                </h3>
                                <p className="text-sm text-[var(--muted)] flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Confirmation: {booking.confirmationNumber}
                                </p>
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                getStatusBadge()
                            )}>
                                {booking.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] mb-4">
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {booking.numberOfGuests} Guest{booking.numberOfGuests > 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {booking.numberOfNights} Night{booking.numberOfNights > 1 ? 's' : ''}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                            <div>
                                <p className="text-xs text-[var(--muted)]">Total</p>
                                <p className="text-xl font-bold text-[var(--gold)]">
                                    ${Number(booking.totalAmount).toFixed(2)}
                                </p>
                            </div>

                            {/* Cancel Button - Always show for non-cancelled/completed bookings */}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <div className="flex flex-col items-end gap-1">
                                    <button
                                        onClick={() => canCancel && setShowCancelModal(true)}
                                        disabled={!canCancel}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-medium",
                                            "flex items-center gap-2 transition-colors duration-200",
                                            canCancel
                                                ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                                                : "bg-gray-100 text-gray-400 dark:bg-gray-800/50 dark:text-gray-500 cursor-not-allowed"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel Reservation
                                    </button>
                                    {!canCancel && (
                                        <p className="text-xs text-[var(--muted)]">
                                            {isPast(checkInDate) ? "Check-in date has passed" : "Cannot cancel this booking"}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Show cancelled/completed status message */}
                            {(booking.status === 'cancelled' || booking.status === 'completed') && (
                                <span className={cn(
                                    "text-xs px-3 py-1.5 rounded-lg",
                                    booking.status === 'cancelled'
                                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                        : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                )}>
                                    {booking.status === 'cancelled' ? "Reservation cancelled" : "Stay completed"}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => !isLoading && setShowCancelModal(false)}
                    />

                    {/* Modal */}
                    <div className={cn(
                        "relative w-full max-w-md rounded-2xl p-6",
                        "bg-[var(--surface)] border border-[var(--border)]",
                        "shadow-2xl animate-scaleIn"
                    )}>
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                                    Booking Cancelled
                                </h3>
                                <p className="text-sm text-[var(--muted)]">
                                    Your booking has been successfully cancelled.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--foreground)]">
                                            Cancel Reservation?
                                        </h3>
                                        <p className="text-sm text-[var(--muted)] mt-1">
                                            Are you sure you want to cancel your booking for{' '}
                                            <strong>{booking.room?.name || 'this room'}</strong>?
                                        </p>
                                    </div>
                                </div>

                                {/* Cancellation Fee Info */}
                                <div className={cn(
                                    "rounded-xl p-4 mb-6",
                                    cancellationInfo.fee > 0
                                        ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                                        : "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                                )}>
                                    <p className={cn(
                                        "text-sm font-medium",
                                        cancellationInfo.fee > 0
                                            ? "text-amber-700 dark:text-amber-400"
                                            : "text-emerald-700 dark:text-emerald-400"
                                    )}>
                                        {cancellationInfo.message}
                                    </p>
                                    {cancellationInfo.fee > 0 && (
                                        <p className="text-xs text-[var(--muted)] mt-1">
                                            Refund amount: ${(booking.totalAmount - cancellationInfo.fee).toFixed(2)}
                                        </p>
                                    )}
                                </div>

                                {error && (
                                    <div className="rounded-xl p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-xl text-sm font-medium",
                                            "bg-[var(--surface-dim)] text-[var(--foreground)]",
                                            "hover:bg-[var(--border)] transition-colors",
                                            "disabled:opacity-50"
                                        )}
                                    >
                                        Keep Booking
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-xl text-sm font-medium",
                                            "bg-red-500 text-white",
                                            "hover:bg-red-600 transition-colors",
                                            "disabled:opacity-50",
                                            "flex items-center justify-center gap-2"
                                        )}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Cancelling...
                                            </>
                                        ) : (
                                            "Confirm Cancel"
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
