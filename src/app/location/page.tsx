import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";
import { db } from "@/lib/infrastructure/database/drizzle";
import { nearbySpots } from "@/lib/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Clock, Car, Footprints, Building, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we're fetching data
export const dynamic = 'force-dynamic';

export default async function LocationPage() {
    // Fetch nearby spots from DB
    const spots = await db.select().from(nearbySpots).where(eq(nearbySpots.isActive, true));

    // Property landmarks for internal navigation
    const propertyLandmarks = [
        {
            name: "The Azure Restaurant",
            category: "Dining",
            description: "Beachfront fine dining with sunset views.",
            link: "/dining",
            icon: Building
        },
        {
            name: "Serenity Spa",
            category: "Wellness",
            description: "Located in the secluded north garden wing.",
            link: "/services",
            icon: Building
        },
        {
            name: "Grand Ballroom",
            category: "Events",
            description: "Central main building, ground floor.",
            link: "/chat?intent=event_info",
            icon: Building
        }
    ];

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section - Map Focus */}
            <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center bg-zinc-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('/globe.svg')] bg-no-repeat bg-center bg-contain"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background z-0" />

                <div className="relative z-10 container mx-auto px-4 text-center space-y-6 animate-fadeInUp">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Our <span className="text-[var(--gold)]">Location</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
                        Nestled in paradise, yet conveniently connected. Explore our property and the breathtaking surroundings.
                    </p>
                </div>
            </section>

            {/* Interactive Map Section */}
            <section className="py-12 container mx-auto px-4">
                <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl h-[500px] relative bg-[var(--surface-dim)] group">
                    {/* Placeholder Map (iframe) - Using a generic tropical location for demo */}
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.3860555364175!2d-80.123456!3d25.789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sEco%20Hotel!5e0!3m2!1sen!2sus!4v1625680000000!5m2!1sen!2sus"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Hotel Application Map"
                        className="group-hover:grayscale-0 transition-all duration-700"
                    ></iframe>

                    <div className="absolute bottom-4 right-4 bg-[var(--surface)] p-4 rounded-xl shadow-lg border border-[var(--border)] max-w-xs">
                        <div className="flex items-start gap-3">
                            <MapPin className="text-[var(--gold)] w-5 h-5 mt-1" />
                            <div>
                                <p className="font-semibold text-foreground">HotelAI Resort & Spa</p>
                                <p className="text-sm text-muted-foreground mt-1">Tropical Paradise Island, 12345</p>
                                <Button size="sm" variant="link" className="px-0 text-[var(--gold)] mt-2 h-auto" asChild>
                                    <Link href="https://maps.google.com" target="_blank">Get Directions <ArrowRight className="w-3 h-3 ml-1" /></Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Property Navigation */}
            <section className="py-16 bg-[var(--surface-dim)]">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-3 mb-10">
                        <Navigation className="w-6 h-6 text-[var(--gold)]" />
                        <h2 className="text-3xl font-bold text-foreground">Resort Navigation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {propertyLandmarks.map((landmark, idx) => (
                            <Link href={landmark.link} key={idx} className="block group">
                                <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--gold)] hover:shadow-lg transition-all duration-300 h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-[var(--surface-dim)] rounded-lg group-hover:bg-[var(--gold)] group-hover:text-white transition-colors">
                                            <landmark.icon className="w-6 h-6" />
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-[var(--gold)] transition-transform group-hover:translate-x-1" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2">{landmark.name}</h3>
                                    <span className="text-xs uppercase tracking-wider text-[var(--gold)] font-medium mb-3 block">{landmark.category}</span>
                                    <p className="text-muted-foreground text-sm">{landmark.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Nearby Spots */}
            <section className="py-20 container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <span className="text-sm font-semibold text-[var(--gold)] uppercase tracking-wider">Explore the Area</span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">Nearby Attractions</h2>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/chat?intent=concierge_request">Ask Concierge for Tips</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {spots.length > 0 ? (
                        spots.map((spot) => (
                            <div key={spot.id} className="group hover-lift bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                                <div className="h-2 bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)]" />
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-foreground">{spot.name}</h3>
                                        <div className="px-2 py-1 rounded text-xs font-medium bg-[var(--surface-dim)] text-muted-foreground capitalize">
                                            {spot.category}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed min-h-[3rem]">
                                        {spot.description}
                                    </p>

                                    <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)] group-hover:border-[var(--gold)]/30 transition-colors">
                                        <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                                            <Footprints className="w-4 h-4 text-[var(--gold)]" />
                                            <span className="font-medium">{spot.distance}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span>Approx. {spot.estimatedTravelTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-[var(--surface-dim)] rounded-xl border border-dashed border-[var(--border)]">
                            <p>No nearby attraction data available at the moment.</p>
                            <Button variant="link" className="text-[var(--gold)]" asChild>
                                <Link href="/chat">Ask us directly</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            <FloatingChatButton />
            <Footer />
        </main>
    );
}
