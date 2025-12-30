import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { db } from "@/lib/infrastructure/database/drizzle";
import { bookings } from "@/lib/infrastructure/database/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, User, CreditCard } from "lucide-react";
import SignOutButton from "@/components/auth/sign-out-button"; // Will create this

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers() // await headers() is required in Next.js 15+ (and 16 apparently)
    });

    if (!session) {
        redirect("/auth");
    }

    const user = session.user;

    // Fetch bookings for this user based on email matching
    const userBookings = await db.query.bookings.findMany({
        where: eq(bookings.guestEmail, user.email),
        with: {
            room: true
        },
        orderBy: [desc(bookings.checkInDate)],
        limit: 5
    });

    return (
        <main className="min-h-screen flex flex-col bg-background pt-24">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Dashboard</h1>
                        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
                    </div>
                    <SignOutButton />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* User Profile Card */}
                    <Card className="md:col-span-1 border-[var(--border)]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-[var(--gold)]" />
                                Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
                                <p className="font-medium">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground uppercase tracking-wider">Member Since</label>
                                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="pt-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-[var(--gold)]/10 text-[var(--gold-dark)]'}`}>
                                    {user.role === 'admin' ? 'Admin Access' : 'Gold Member'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bookings */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-[var(--gold)]" />
                            Recent Bookings
                        </h2>

                        {userBookings.length > 0 ? (
                            <div className="space-y-4">
                                {userBookings.map(booking => (
                                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="bg-[var(--surface-dim)] p-6 md:w-1/3 flex flex-col justify-center text-center md:text-left">
                                                <p className="text-sm text-muted-foreground">Check-in</p>
                                                <p className="text-lg font-bold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                                <div className="h-px bg-border my-2 w-full" />
                                                <p className="text-sm text-muted-foreground">Check-out</p>
                                                <p className="text-lg font-bold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                            </div>
                                            <div className="p-6 flex-1 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{booking.room?.name || "Room details unavailable"}</h3>
                                                        <p className="text-sm text-muted-foreground">Conf: {booking.confirmationNumber}</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <p className="text-sm text-muted-foreground">{booking.numberOfGuests} Guests · {booking.numberOfNights} Nights</p>
                                                    <p className="font-bold text-[var(--gold)]">${booking.totalAmount}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="p-8 text-center text-muted-foreground border-dashed">
                                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>No bookings found linked to your email.</p>
                                <Button variant="link" asChild className="text-[var(--gold)]">
                                    <a href="/chat">Book a stay now</a>
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
