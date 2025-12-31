import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { db } from "@/lib/infrastructure/database/drizzle";
import { bookings, services, restaurants, user } from "@/lib/infrastructure/database/schema";
import { count, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, Utensils, Flower2 } from "lucide-react";
import { AddKnowledgeForm } from "@/components/admin/add-knowledge-form";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || session.user.role !== 'admin') {
        // If logged in but not admin, go to dashboard. If not logged in, auth will handle.
        redirect(session ? "/dashboard" : "/auth");
    }

    // Fetch Stats
    const [bookingCount] = await db.select({ value: count() }).from(bookings);
    const [userCount] = await db.select({ value: count() }).from(user);
    const [serviceCount] = await db.select({ value: count() }).from(services);
    const [restaurantCount] = await db.select({ value: count() }).from(restaurants);

    // Fetch Recent Bookings for Admin
    const recentBookings = await db.query.bookings.findMany({
        with: {
            room: true
        },
        orderBy: [desc(bookings.createdAt)],
        limit: 10
    });

    const stats = [
        { label: "Total Users", value: userCount.value, icon: Users, color: "text-blue-500" },
        { label: "Total Bookings", value: bookingCount.value, icon: CalendarCheck, color: "text-green-500" },
        { label: "Restaurants", value: restaurantCount.value, icon: Utensils, color: "text-orange-500" },
        { label: "Services", value: serviceCount.value, icon: Flower2, color: "text-purple-500" },
    ];

    return (
        <main className="min-h-screen flex flex-col bg-background pt-24">
            <Navbar />
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="mb-8 border-b pb-4">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest px-2 py-1 bg-red-100 rounded">Admin Area</span>
                    <h1 className="text-3xl font-bold mt-2">System Overview</h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {stats.map((stat, i) => (
                        <Card key={i}>
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-3 rounded-full bg-opacity-10 ${stat.color} bg-current`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold">Recent Booking Activity</h2>
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-[var(--surface-dim)] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">Confirmation</th>
                                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">Guest</th>
                                            <th className="px-6 py-3 text-left font-medium text-muted-foreground">Status</th>
                                            <th className="px-6 py-3 text-right font-medium text-muted-foreground">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {recentBookings.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-[var(--surface-dim)]/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs">{booking.confirmationNumber}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium">{booking.guestName}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">${booking.totalAmount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Knowledge Base Actions */}
                    <div className="lg:col-span-1">
                        <AddKnowledgeForm />
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
