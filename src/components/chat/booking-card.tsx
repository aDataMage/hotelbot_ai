/**
 * COMPONENT: Booking Card
 * 
 * FUNCTION: Displays a booking confirmation with premium styling.
 * Used in chat interface to render createBooking tool results.
 */
import { CheckCircle, Calendar, Users, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingData {
    success: boolean;
    booking?: {
        confirmationNumber: string;
        roomName?: string;
        roomNumber?: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        guests: number;
        totalAmount: number;
        guestEmail: string;
        status: string;
    };
    message?: string;
    error?: string;
}

interface BookingCardProps {
    data: BookingData;
}

export function BookingCard({ data }: BookingCardProps) {
    if (data.error || !data.success) {
        return (
            <div className={cn(
                "w-full max-w-md rounded-2xl overflow-hidden",
                "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50",
                "animate-scaleIn"
            )}>
                <div className="px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-red-700 dark:text-red-400">
                                Booking Failed
                            </h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">
                                {data.error || 'Unable to complete your booking'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const booking = data.booking!;

    return (
        <div className={cn(
            "w-full max-w-md rounded-2xl overflow-hidden",
            "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50",
            "animate-scaleIn"
        )}>
            {/* Success Header */}
            <div className="px-5 pt-5 pb-4">
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                            Booking Confirmed!
                        </h3>
                        <div className="mt-1.5 inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800">
                            <span className="text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                                {booking.confirmationNumber}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room Info */}
            {booking.roomName && (
                <div className="px-5 pb-4">
                    <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-emerald-100 dark:border-emerald-800/30">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                            {booking.roomName}
                        </p>
                        {booking.roomNumber && (
                            <p className="text-xs text-[var(--muted)] mt-0.5">
                                Room #{booking.roomNumber}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Details Grid */}
            <div className="px-5 pb-4">
                <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                        icon={Calendar}
                        label="Check-in"
                        value={booking.checkIn}
                    />
                    <DetailItem
                        icon={Calendar}
                        label="Check-out"
                        value={booking.checkOut}
                    />
                    <DetailItem
                        icon={Users}
                        label="Guests"
                        value={`${booking.guests} guest${booking.guests > 1 ? 's' : ''}`}
                    />
                    <DetailItem
                        icon={Mail}
                        label="Duration"
                        value={`${booking.nights} night${booking.nights > 1 ? 's' : ''}`}
                    />
                </div>
            </div>

            {/* Email */}
            <div className="px-5 pb-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{booking.guestEmail}</span>
                </div>
            </div>

            {/* Total */}
            <div className="px-5 py-4 border-t border-emerald-200 dark:border-emerald-800/50 bg-emerald-100/50 dark:bg-emerald-900/20">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted)]">Total Amount</span>
                    <span className="text-xl font-semibold text-emerald-700 dark:text-emerald-400">
                        ${booking.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Message */}
            {data.message && (
                <div className="px-5 py-3 bg-emerald-100/30 dark:bg-emerald-900/10 border-t border-emerald-200 dark:border-emerald-800/50">
                    <p className="text-xs text-[var(--muted)]">{data.message}</p>
                </div>
            )}
        </div>
    );
}

function DetailItem({
    icon: Icon,
    label,
    value
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/60 dark:bg-white/5">
            <Icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
                <p className="text-[11px] text-[var(--muted)] uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{value}</p>
            </div>
        </div>
    );
}
