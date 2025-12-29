import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";
import { getRoomService } from "@/lib/infrastructure/di/container";
import { Button } from "@/components/ui/button";
import { Users, Bed, Eye, ArrowRight, Search, Filter } from "lucide-react";

// Room Card Component for listing
function RoomListCard({ room }: { room: any }) {
    return (
        <div className="group bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-56 overflow-hidden">
                <Image
                    src={room.images[0] || "/rooms/ocean-breeze-1.jpg"}
                    alt={room.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    ${room.basePricePerNight}<span className="text-xs font-normal text-muted-foreground">/night</span>
                </div>
                {room.isAvailable ? (
                    <div className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-medium text-white">
                        Available
                    </div>
                ) : (
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-medium text-white">
                        Booked
                    </div>
                )}
            </div>

            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-[var(--gold)] transition-colors">
                        {room.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {room.description}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-foreground">
                        <Bed className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span className="capitalize">{room.bedSize}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-foreground">
                        <Eye className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span className="capitalize">{room.viewType}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-foreground">
                        <Users className="w-3.5 h-3.5 text-[var(--gold)]" />
                        <span>Up to {room.maxOccupancy}</span>
                    </span>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                    <Link
                        href={`/rooms/${room.id}`}
                        className="text-sm font-medium text-foreground hover:text-[var(--gold)] transition-colors flex items-center gap-1"
                    >
                        View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Button size="sm" className="gradient-gold text-white" asChild>
                        <Link href={`/chat?roomId=${room.id}&intent=book`}>Book Now</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Room Grid with Server Component data fetching
async function RoomGrid() {
    const roomService = getRoomService();
    const rooms = await roomService.getAvailableRooms();

    if (rooms.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No rooms available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
                <RoomListCard key={room.id} room={room} />
            ))}
        </div>
    );
}

export default function BookingPage() {
    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-12 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                            Browse Our Rooms
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Discover the perfect accommodation for your stay. Each room offers
                            unique features and stunning views.
                        </p>
                    </div>

                    {/* Search/Filter Bar */}
                    <div className="mt-8 max-w-4xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-background border border-border shadow-sm">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search rooms..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-[var(--gold)] focus:outline-none text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <select className="px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-[var(--gold)] focus:outline-none text-sm text-muted-foreground">
                                    <option value="">All Views</option>
                                    <option value="ocean">Ocean View</option>
                                    <option value="garden">Garden View</option>
                                    <option value="city">City View</option>
                                    <option value="pool">Pool View</option>
                                </select>
                                <select className="px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-[var(--gold)] focus:outline-none text-sm text-muted-foreground">
                                    <option value="">All Beds</option>
                                    <option value="single">Single</option>
                                    <option value="double">Double</option>
                                    <option value="queen">Queen</option>
                                    <option value="king">King</option>
                                </select>
                                <Button variant="outline" size="icon" className="px-3">
                                    <Filter className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Room Grid */}
            <section className="py-12 flex-1">
                <div className="container mx-auto px-4">
                    <Suspense
                        fallback={
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-96 rounded-2xl bg-muted/50 animate-pulse" />
                                ))}
                            </div>
                        }
                    >
                        <RoomGrid />
                    </Suspense>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-zinc-950 text-white">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-bold">Need Help Choosing?</h2>
                    <p className="text-white/70 max-w-xl mx-auto">
                        Our AI concierge can help you find the perfect room based on your
                        preferences, budget, and travel dates.
                    </p>
                    <Button size="lg" className="gradient-gold text-white" asChild>
                        <Link href="/chat">Chat with AI Concierge</Link>
                    </Button>
                </div>
            </section>

            <Footer />
            <FloatingChatButton />
        </main>
    );
}