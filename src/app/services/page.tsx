import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";
import { db } from "@/lib/infrastructure/database/drizzle";
import { services } from "@/lib/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flower2, Waves, Car, ConciergeBell, Info, ArrowRight, CalendarClock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

// Force dynamic rendering since we're fetching data
export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    // Fetch active services directly from DB
    const allServices = await db.select().from(services).where(eq(services.isActive, true));

    // Group services by category for better layout
    const groupedServices = allServices.reduce((acc, service) => {
        const category = service.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(service);
        return acc;
    }, {} as Record<string, typeof allServices>);

    // Helper to get icon for category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'spa': return <Flower2 className="w-6 h-6" />;
            case 'recreation': return <Waves className="w-6 h-6" />;
            case 'transport': return <Car className="w-6 h-6" />;
            case 'concierge': return <ConciergeBell className="w-6 h-6" />;
            default: return <Info className="w-6 h-6" />;
        }
    };

    // Helper to get background color for category section
    const getCategoryColor = (index: number) => {
        return index % 2 === 0 ? "bg-background" : "bg-[var(--surface-dim)]";
    };

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-zinc-900">
                    {/* Fallback pattern if no image */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center space-y-6 animate-fadeInUp">
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-xl">
                        World-Class <span className="text-[var(--gold)]">Amenities</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
                        Elevate your stay with our curated selection of premium services designed for your ultimate comfort and relaxation.
                    </p>
                </div>
            </section>

            {/* Services List by Category */}
            <div className="flex-1">
                {Object.entries(groupedServices).map(([category, categoryServices], index) => (
                    <section key={category} className={cn("py-20", getCategoryColor(index))}>
                        <div className="container mx-auto px-4">
                            <div className="flex items-center gap-3 mb-12">
                                <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center shadow-md text-white">
                                    {getCategoryIcon(category)}
                                </div>
                                <h2 className="text-3xl font-bold capitalize text-foreground">{category}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {categoryServices.map((service) => (
                                    <div key={service.id} className="group relative bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-luxury transition-all duration-300 hover:-translate-y-1">
                                        <div className="p-8 space-y-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="text-xl font-bold text-foreground group-hover:text-[var(--gold)] transition-colors">
                                                        {service.name}
                                                    </h3>
                                                    {service.price && (
                                                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--surface-dim)] text-xs font-semibold text-[var(--gold)] border border-[var(--border)]">
                                                            ${parseFloat(service.price).toFixed(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {service.description}
                                                </p>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <CalendarClock className="w-4 h-4 text-[var(--gold)]" />
                                                    <span>{service.operatingHours}</span>
                                                </div>
                                                {service.bookingRequired && (
                                                    <div className="flex items-center gap-2 text-sm text-[var(--gold-dark)]">
                                                        <Info className="w-4 h-4" />
                                                        <span>Booking Required</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2">
                                                <Button variant="ghost" className="w-full justify-between hover:bg-[var(--surface-dim)] group/btn" asChild>
                                                    <Link href={`/chat?intent=book_service&service=${encodeURIComponent(service.name)}`}>
                                                        <span className="font-medium">Request Service</span>
                                                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* CTA Section */}
            <section className="py-24 bg-zinc-950 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('/file.svg')] bg-repeat opacity-5"></div>
                <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Need something special?</h2>
                    <p className="text-white/60 max-w-xl mx-auto text-lg">
                        Our concierge team is available 24/7 to fulfill any special requests or creating custom experiences just for you.
                    </p>
                    <Button size="lg" className="gradient-gold text-white shadow-xl hover:scale-105 transition-transform" asChild>
                        <Link href="/chat?intent=concierge_request">
                            Contact Concierge
                        </Link>
                    </Button>
                </div>
            </section>

            <FloatingChatButton />
            <Footer />
        </main>
    );
}
