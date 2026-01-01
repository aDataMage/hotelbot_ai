import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { db } from "@/lib/infrastructure/database/drizzle";
import { bookings } from "@/lib/infrastructure/database/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { BookingActions } from "@/components/dashboard/booking-actions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Calendar, User, Settings, LogOut, MessageSquare } from "lucide-react";
import Link from "next/link";
import SignOutButton from "@/components/auth/sign-out-button";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth");
    }

    const user = session.user;

    // Fetch all bookings for this user
    const userBookings = await db.query.bookings.findMany({
        where: eq(bookings.guestEmail, user.email),
        with: {
            room: true
        },
        orderBy: [desc(bookings.checkInDate)],
    });

    // Calculate stats
    const now = new Date();
    const upcomingStays = userBookings.filter(
        b => b.status === 'confirmed' && new Date(b.checkInDate) > now
    ).length;

    // Include both confirmed and completed bookings for total spent (exclude cancelled)
    const activeBookings = userBookings.filter(
        b => b.status === 'confirmed' || b.status === 'completed'
    );
    const totalSpent = activeBookings.reduce(
        (sum, b) => sum + Number(b.totalAmount),
        0
    );
    const totalNights = activeBookings.reduce(
        (sum, b) => sum + Number(b.numberOfNights),
        0
    );

    // Get recent bookings (limit to 10)
    const recentBookings = userBookings.slice(0, 10);

    return (
        <main className="min-h-screen flex flex-col bg-[var(--background)]">
            <Navbar />

            <div className="flex-1 pt-20">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-dim)] border-b border-[var(--border)]">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center shadow-lg text-white text-2xl font-bold">
                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
                                        Welcome back, {user.name?.split(' ')[0]}!
                                    </h1>
                                    <p className="text-[var(--muted)] text-sm md:text-base">
                                        {user.email}
                                    </p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${user.role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                        : 'bg-[var(--gold)]/10 text-[var(--gold-dark)] dark:text-[var(--gold)]'
                                        }`}>
                                        {user.role === 'admin' ? '✨ Admin Access' : '⭐ Gold Member'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/chat"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-gold text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Book a Stay
                                </Link>
                                <SignOutButton />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
                    {/* Stats Section */}
                    <section>
                        <DashboardStats
                            upcomingStays={upcomingStays}
                            totalSpent={totalSpent}
                            totalNights={totalNights}
                            memberSince={new Date(user.createdAt)}
                        />
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                            Quick Actions
                        </h2>
                        <QuickActions />
                    </section>

                    {/* Bookings Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[var(--gold)]" />
                                Your Reservations
                            </h2>
                            {userBookings.length > 10 && (
                                <span className="text-sm text-[var(--muted)]">
                                    Showing 10 of {userBookings.length}
                                </span>
                            )}
                        </div>

                        {recentBookings.length > 0 ? (
                            <div className="space-y-4">
                                {recentBookings.map(booking => (
                                    <BookingActions
                                        key={booking.id}
                                        booking={{
                                            id: booking.id,
                                            confirmationNumber: booking.confirmationNumber,
                                            checkInDate: booking.checkInDate.toISOString(),
                                            checkOutDate: booking.checkOutDate.toISOString(),
                                            numberOfGuests: booking.numberOfGuests,
                                            numberOfNights: booking.numberOfNights,
                                            totalAmount: Number(booking.totalAmount),
                                            status: booking.status,
                                            room: booking.room ? {
                                                name: booking.room.name,
                                                roomNumber: booking.room.roomNumber
                                            } : null
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-[var(--border)] p-12 text-center">
                                <div className="w-16 h-16 rounded-full bg-[var(--surface-dim)] flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-[var(--muted)]" />
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                                    No reservations yet
                                </h3>
                                <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
                                    Start planning your perfect getaway. Chat with our AI concierge to find the ideal room.
                                </p>
                                <Link
                                    href="/chat"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-gold text-white font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Start Booking
                                </Link>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}
