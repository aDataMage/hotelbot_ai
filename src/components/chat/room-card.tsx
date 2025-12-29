/**
 * COMPONENT: Room Card
 * 
 * FUNCTION: Displays a room search result with premium styling.
 * Used in chat interface to render searchRooms tool results.
 */
import { Bed, Users, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomData {
    id: string;
    roomNumber: string;
    name: string;
    description: string;
    bedSize: string;
    viewType: string;
    maxOccupancy: number;
    amenities: string[];
    pricing: {
        pricePerNight: number;
        numberOfNights: number;
        subtotal: number;
        tax: number;
        serviceCharge: number;
        total: number;
    };
}

interface RoomCardProps {
    room: RoomData;
    onSelect?: (roomId: string) => void;
}

export function RoomCard({ room, onSelect }: RoomCardProps) {
    return (
        <div
            onClick={() => onSelect?.(room.id)}
            className={cn(
                "group w-full max-w-sm rounded-2xl overflow-hidden cursor-pointer",
                "bg-[var(--surface)] border border-[var(--border)]",
                "shadow-sm hover-lift",
                "transition-all duration-300"
            )}
        >
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-[var(--foreground)] truncate group-hover:text-[var(--gold)] transition-colors">
                            {room.name}
                        </h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                            Room #{room.roomNumber}
                        </p>
                    </div>
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium gradient-gold text-white shadow-sm">
                        Available
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="px-5 pb-4">
                <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {room.description}
                </p>
            </div>

            {/* Features */}
            <div className="px-5 pb-4">
                <div className="flex flex-wrap gap-2">
                    <FeatureTag icon={Bed} label={room.bedSize} />
                    <FeatureTag icon={Eye} label={room.viewType} />
                    <FeatureTag icon={Users} label={`Up to ${room.maxOccupancy}`} />
                </div>
            </div>

            {/* Pricing */}
            {room.pricing && (
                <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--surface-dim)]/50">
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-2xl font-semibold text-[var(--foreground)]">
                                <span className="text-sm font-normal text-[var(--muted)]">$</span>
                                {room.pricing.total.toFixed(0)}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                                {room.pricing.numberOfNights} night{room.pricing.numberOfNights > 1 ? 's' : ''} · incl. taxes
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-[var(--muted)]">
                                ${room.pricing.pricePerNight}<span className="text-xs">/night</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeatureTag({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--surface-dim)] text-xs text-[var(--foreground)]">
            <Icon className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span className="capitalize">{label}</span>
        </div>
    );
}
