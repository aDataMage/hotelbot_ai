/**
 * COMPONENT: Tool Result Renderer
 * 
 * FUNCTION: Routes tool invocation results to the appropriate UI component.
 * Enhanced with premium styling and consistent design language.
 */
import { RoomCard } from "./room-card";
import { BookingCard } from "./booking-card";
import { Info, AlertTriangle, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolResultProps {
    toolName: string;
    state: 'partial-call' | 'call' | 'result';
    args?: Record<string, unknown>;
    result?: unknown;
}

export function ToolResult({ toolName, state, args, result }: ToolResultProps) {
    // Show loading state for pending tool calls
    if (state === 'partial-call' || state === 'call') {
        return (
            <div className={cn(
                "w-full max-w-md rounded-2xl overflow-hidden",
                "bg-[var(--surface)] border border-[var(--border)]",
                "shadow-sm"
            )}>
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--surface-dim)] flex items-center justify-center animate-shimmer">
                            <Search className="w-4 h-4 text-[var(--muted)]" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 w-24 rounded-full animate-shimmer" />
                            <div className="h-2 w-32 rounded-full animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render based on tool name
    switch (toolName) {
        case 'searchRooms': {
            const data = result as { rooms?: unknown[]; count?: number; error?: string };
            if (data?.error) {
                return <ErrorCard message={data.error} />;
            }
            if (data?.rooms && Array.isArray(data.rooms) && data.rooms.length > 0) {
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--muted)]">
                            Found {data.count || data.rooms.length} available room{(data.count || data.rooms.length) !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {data.rooms.slice(0, 3).map((room: any) => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                    </div>
                );
            }
            return <InfoCard message="No rooms available for your selected dates and criteria." />;
        }

        case 'createBooking': {
            return <BookingCard data={result as any} />;
        }

        case 'searchKnowledge': {
            const data = result as { results?: { title: string; content: string; category: string }[]; error?: string };
            if (data?.error) {
                return <ErrorCard message={data.error} />;
            }
            if (data?.results && data.results.length > 0) {
                return (
                    <div className="space-y-3">
                        {data.results.slice(0, 3).map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "w-full max-w-md rounded-xl overflow-hidden",
                                    "bg-[var(--surface)] border border-[var(--border)]",
                                    "shadow-sm hover-lift transition-all duration-200"
                                )}
                            >
                                <div className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                                            <Info className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[var(--foreground)]">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
                                                {item.content}
                                            </p>
                                            <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--surface-dim)] text-[var(--muted)] uppercase tracking-wide">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            return <InfoCard message="No information found for your query." />;
        }

        case 'escalateToHuman': {
            const data = result as { escalated?: boolean; message?: string; ticketId?: string };
            return (
                <div className={cn(
                    "w-full max-w-md rounded-2xl overflow-hidden",
                    "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50",
                    "animate-scaleIn"
                )}>
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                                    Escalated to Human Agent
                                </h4>
                                {data?.ticketId && (
                                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                                        Ticket: <span className="font-mono font-medium">{data.ticketId}</span>
                                    </p>
                                )}
                                {data?.message && (
                                    <p className="text-xs text-[var(--muted)] mt-2">{data.message}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        default:
            return null;
    }
}

function InfoCard({ message }: { message: string }) {
    return (
        <div className={cn(
            "w-full max-w-md rounded-xl overflow-hidden",
            "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50"
        )}>
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <Info className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{message}</p>
                </div>
            </div>
        </div>
    );
}

function ErrorCard({ message }: { message: string }) {
    return (
        <div className={cn(
            "w-full max-w-md rounded-xl overflow-hidden",
            "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50"
        )}>
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
                </div>
            </div>
        </div>
    );
}
