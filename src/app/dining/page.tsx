import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";
import { db } from "@/lib/infrastructure/database/drizzle";
import { restaurants } from "@/lib/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Utensils, Clock, MapPin, ChefHat, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we're fetching data
export const dynamic = 'force-dynamic';

export default async function DiningPage() {
    // Fetch restaurants directly from DB
    const allRestaurants = await db.query.restaurants.findMany({
        where: eq(restaurants.isActive, true),
        with: {
            menuItems: {
                limit: 4, // Show 4 sample items
                where: (items, { eq }) => eq(items.isAvailable, true)
            }
        },
        orderBy: (restaurants, { asc }) => [asc(restaurants.name)],
    });

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/dining-bg.jpg"
                        alt="Fine Dining at HotelAI"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center space-y-6 animate-fadeInUp">
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-xl">
                        Culinary <span className="text-[var(--gold)]">Excellence</span>
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                        Embark on a gastronomic journey with our award-winning restaurants,
                        where local flavors meet international expertise.
                    </p>
                </div>
            </section>

            {/* Restaurants List */}
            <section className="py-24 container mx-auto px-4 space-y-32">
                {allRestaurants.map((restaurant, index) => (
                    <div
                        key={restaurant.id}
                        className={cn(
                            "flex flex-col gap-12 items-center",
                            index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                        )}
                    >
                        {/* Restaurant Info */}
                        <div className="flex-1 space-y-8 w-full">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[var(--gold)]">
                                    <Utensils className="w-5 h-5" />
                                    <span className="text-sm font-semibold uppercase tracking-widest">{restaurant.cuisineType}</span>
                                </div>
                                <h2 className="text-4xl font-bold text-foreground">{restaurant.name}</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {restaurant.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-dim)]/50 border border-[var(--border)]">
                                    <Clock className="w-5 h-5 text-[var(--gold)] mt-1" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Opening Hours</h4>
                                        <p className="text-sm text-muted-foreground">{restaurant.operatingHours}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-dim)]/50 border border-[var(--border)]">
                                    <MapPin className="w-5 h-5 text-[var(--gold)] mt-1" />
                                    <div>
                                        <h4 className="font-medium text-foreground">Location</h4>
                                        <p className="text-sm text-muted-foreground">{restaurant.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button size="lg" className="gradient-gold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all" asChild>
                                    <Link href={`/chat?intent=book_table&restaurant=${encodeURIComponent(restaurant.name)}`}>
                                        Reserve a Table
                                    </Link>
                                </Button>
                                {restaurant.reservationRequired && (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface-dim)] text-xs font-medium text-muted-foreground border border-[var(--border)]">
                                        <Info className="w-4 h-4" />
                                        Reservation Required
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Menu Preview / Visual Card */}
                        <div className="flex-1 w-full">
                            <div className="relative group">
                                {/* Decorative elements */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity" />

                                <div className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 md:p-12 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-serif italic text-foreground">Signature Dishes</h3>
                                        <ChefHat className="w-6 h-6 text-[var(--gold)] opacity-50" />
                                    </div>

                                    <div className="space-y-6">
                                        {restaurant.menuItems.length > 0 ? (
                                            restaurant.menuItems.map((item) => (
                                                <div key={item.id} className="group/item flex justify-between items-baseline gap-4 pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                                                    <div>
                                                        <h4 className="font-medium text-foreground group-hover/item:text-[var(--gold)] transition-colors">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <span className="font-semibold text-[var(--gold)] whitespace-nowrap">
                                                        ${parseFloat(item.price).toFixed(0)}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic text-center py-8">
                                                Seasonal menu available upon request.
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                            Price Range: <span className="text-[var(--gold)] font-bold text-base ml-2">{restaurant.priceRange}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            <FloatingChatButton />
            <Footer />
        </main>
    );
}
