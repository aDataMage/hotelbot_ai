import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { getRoomService } from "@/lib/infrastructure/di/container";
import { ArrowLeft, Users, Bed, Monitor, CheckCircle, Wifi, Wind, Coffee } from "lucide-react";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const roomService = getRoomService();
    const room = await roomService.getRoomById(id);

    if (!room) {
        notFound();
    }

    // Default image if missing
    const heroImage = room.images[0] || "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1920";

    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] w-full">
                <Image
                    src={heroImage}
                    alt={room.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white space-y-4 px-4 animate-fadeInUp">
                        <span className="text-sm md:text-base font-semibold uppercase tracking-widest text-[var(--gold)]">
                            Accommodations
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold font-serif">{room.name}</h1>
                        <p className="text-xl md:text-2xl font-light">${room.basePricePerNight} <span className="text-base font-normal opacity-80">/ night</span></p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-12">
                    <div>
                        <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-[var(--gold)] mb-6" asChild>
                            <Link href="/#rooms"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Rooms</Link>
                        </Button>
                        <h2 className="text-3xl font-bold mb-6">Room Overview</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {room.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                            <Users className="w-6 h-6 text-[var(--gold)]" />
                            <div>
                                <p className="text-sm text-muted-foreground">Occupancy</p>
                                <p className="font-semibold">{room.maxOccupancy} Guests</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                            <Bed className="w-6 h-6 text-[var(--gold)]" />
                            <div>
                                <p className="text-sm text-muted-foreground">Bed Type</p>
                                <p className="font-semibold">{room.bedSize}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                            <Monitor className="w-6 h-6 text-[var(--gold)]" />
                            <div>
                                <p className="text-sm text-muted-foreground">View</p>
                                <p className="font-semibold">{room.viewType}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-6">Room Amenities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* If amenities exists use it, else placeholders */}
                            {(room.amenities.length > 0 ? room.amenities : ["Free High-Speed Wi-Fi", "Smart TV with Streaming", "Premium Toiletries", "Mini Bar", "In-room Safe", "Climate Control"]).map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-[var(--gold)] shrink-0" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Booking Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 p-6 rounded-2xl border border-border bg-card shadow-lg sticky-booking-card">
                        <h3 className="text-xl font-bold mb-4">Book your stay</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-border">
                                <span className="text-muted-foreground">Price per night</span>
                                <span className="font-semibold font-mono">${room.basePricePerNight}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-border">
                                <span className="text-muted-foreground">Max Guests</span>
                                <span className="font-semibold">{room.maxOccupancy}</span>
                            </div>

                            <div className="pt-4">
                                <Button size="lg" className="w-full gradient-gold text-white font-semibold shadow-md hover:shadow-lg transition-all" asChild>
                                    <Link href={`/chat?roomId=${room.id}&intent=book`}>
                                        Check Availability with AI
                                    </Link>
                                </Button>
                                <p className="text-xs text-center mt-3 text-muted-foreground">
                                    Our AI Concierge will assist you with dates and special requests.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
            <FloatingChatButton />
        </main>
    );
}
