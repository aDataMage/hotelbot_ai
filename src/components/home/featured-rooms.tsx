import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bed, Monitor } from "lucide-react";
import Image from "next/image";
import { getRoomService } from "@/lib/infrastructure/di/container";

export async function FeaturedRooms() {
    const roomService = getRoomService();
    const rooms = await roomService.getAvailableRooms();
    const featuredRooms = rooms.slice(0, 3); // Show top 3

    return (
        <section id="rooms" className="py-24 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-sm font-semibold text-[var(--gold)] uppercase tracking-wider">Accommodations</span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Featured Suites</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Experience unparalleled comfort in our meticulously designed rooms and suites,
                        each offering breathtaking views and modern amenities.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredRooms.map((room) => (
                        <div key={room.id} className="group bg-background rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={room.images[0] || "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=800"}
                                    alt={room.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-zinc-900 shadow-sm">
                                    ${room.basePricePerNight}<span className="text-xs font-normal text-zinc-600">/night</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-[var(--gold)] transition-colors">
                                    {room.name}
                                </h3>

                                <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[var(--gold)]" />
                                        <span>{room.maxOccupancy} Guests</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bed className="w-4 h-4 text-[var(--gold)]" />
                                        <span>{room.bedSize}</span>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <Monitor className="w-4 h-4 text-[var(--gold)]" />
                                        <span>{room.viewType}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border flex items-center justify-between">
                                    <Link href={`/rooms/${room.id}`} className="text-sm font-medium text-foreground hover:text-[var(--gold)] transition-colors flex items-center gap-1">
                                        DETAILS <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Button size="sm" className="gradient-gold text-white" asChild>
                                        <Link href={`/chat?roomId=${room.id}`}>Book Now</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
