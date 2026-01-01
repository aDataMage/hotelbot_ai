"use client";

/**
 * COMPONENT: Quick Actions
 * 
 * FUNCTION: Displays quick action buttons for common tasks.
 */
import Link from "next/link";
import { MessageSquare, Bed, HeadphonesIcon, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickActions() {
    const actions = [
        {
            label: "Chat with AI",
            description: "Get instant help",
            href: "/chat",
            icon: MessageSquare,
            color: "text-[var(--gold)]",
            bgColor: "gradient-gold",
        },
        {
            label: "Browse Rooms",
            description: "Explore our suites",
            href: "/booking",
            icon: Bed,
            color: "text-blue-500",
            bgColor: "bg-blue-500",
        },
        {
            label: "Contact Support",
            description: "24/7 assistance",
            href: "/chat",
            icon: HeadphonesIcon,
            color: "text-purple-500",
            bgColor: "bg-purple-500",
        },
        {
            label: "Special Offers",
            description: "Exclusive deals",
            href: "/booking",
            icon: Gift,
            color: "text-pink-500",
            bgColor: "bg-pink-500",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Link
                    key={action.label}
                    href={action.href}
                    className={cn(
                        "rounded-2xl p-5 transition-all duration-200 group",
                        "bg-[var(--surface)] border border-[var(--border)]",
                        "hover:shadow-lg hover:-translate-y-1"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                        action.label === "Chat with AI" ? action.bgColor : "bg-[var(--surface-dim)]",
                        "group-hover:scale-110 transition-transform duration-200"
                    )}>
                        <action.icon className={cn(
                            "w-6 h-6",
                            action.label === "Chat with AI" ? "text-white" : action.color
                        )} />
                    </div>
                    <h3 className="font-semibold text-[var(--foreground)] text-sm">
                        {action.label}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                        {action.description}
                    </p>
                </Link>
            ))}
        </div>
    );
}
