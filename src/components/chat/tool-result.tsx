/**
 * COMPONENT: Tool Result Renderer
 * 
 * FUNCTION: Routes tool invocation results to the appropriate UI component.
 * Enhanced with premium styling and consistent design language.
 */
import { RoomCard } from "./room-card";
import { BookingCard } from "./booking-card";
import { GuestDetailsForm } from "./guest-details-form";
import { Info, AlertTriangle, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolResultProps {
    toolName: string;
    state: 'partial-call' | 'call' | 'result';
    args?: Record<string, unknown>;
    result?: unknown;
    toolCallId?: string;
    onToolResult?: (toolCallId: string, result: any) => void;
}

export function ToolResult({ toolName, state, args, result, toolCallId, onToolResult }: ToolResultProps) {
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
        case 'searchRooms':
        case 'searchRoomsWithPreferences': {
            const data = result as {
                rooms?: unknown[];
                totalAvailable?: number;
                needsPreferences?: boolean;
                error?: string;
                message?: string;
            };

            if (data?.error) {
                return <ErrorCard message={data.error} />;
            }

            // If needsPreferences is true, don't show cards - AI will ask for preferences
            if (data?.needsPreferences) {
                return null;
            }

            if (data?.rooms && Array.isArray(data.rooms) && data.rooms.length > 0) {
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-[var(--muted)]">
                            Found {data.totalAvailable || data.rooms.length} available room{(data.totalAvailable || data.rooms.length) !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {data.rooms.slice(0, 10).map((room: any) => (
                                <RoomCard key={room.id} room={room} />
                            ))}
                        </div>
                    </div>
                );
            }

            // Only show "no rooms" if success is explicitly false
            if (data?.message) {
                return <InfoCard message={data.message} />;
            }

            return <InfoCard message="No rooms available for your selected dates and criteria." />;
        }

        case 'createBooking': {
            return <BookingCard data={result as any} />;
        }

        case 'searchKnowledge': {
            // Don't show knowledge results as cards - let the AI synthesize a response
            // The AI will use these results to create a formatted answer in text
            return null;
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

        case 'requestGuestDetails': {
            return (
                <GuestDetailsForm
                    roomId={args?.roomId as string}
                    onSubmit={(data) => onToolResult?.(toolCallId || 'unknown', data)}
                />
            );
        }

        case 'endChat': {
            const data = result as { endChat?: boolean; farewell?: string; redirectTo?: string; reason?: string };
            return <EndChatCard farewell={data.farewell || 'Thank you for using HotelAI!'} redirectTo={data.redirectTo || '/'} />;
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

function EndChatCard({ farewell, redirectTo }: { farewell: string; redirectTo: string }) {
    const handleRedirect = () => {
        window.location.href = redirectTo;
    };

    return (
        <div className={cn(
            "w-full max-w-md rounded-2xl overflow-hidden",
            "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
            "border border-emerald-200 dark:border-emerald-800/50",
            "animate-scaleIn shadow-lg"
        )}>
            <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <span className="text-3xl">👋</span>
                </div>
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Chat Complete
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-6">
                    {farewell}
                </p>
                <button
                    onClick={handleRedirect}
                    className={cn(
                        "w-full py-3 px-6 rounded-xl font-medium",
                        "bg-emerald-600 hover:bg-emerald-700 text-white",
                        "transition-all duration-200 hover:shadow-md",
                        "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    )}
                >
                    Return to Home
                </button>
            </div>
        </div>
    );
}

