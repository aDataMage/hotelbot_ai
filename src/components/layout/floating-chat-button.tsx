"use client";

import Link from "next/link";
import { Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingChatButton() {
    return (
        <Link
            href="/chat"
            className={cn(
                "fixed bottom-8 right-8 z-50",
                "group flex items-center gap-2 pr-6 pl-2 py-2 rounded-full",
                "bg-white dark:bg-zinc-900 border border-border shadow-lg hover:shadow-xl",
                "transition-all duration-300 hover:scale-105"
            )}
        >
            <div className="relative">
                <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center text-white shadow-md relative z-10">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                {/* Ping effect */}
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--gold)]"></span>
                </span>
            </div>

            <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Chat with AI</span>
                <span className="text-[10px] text-muted-foreground">Online & Ready</span>
            </div>
        </Link>
    );
}
