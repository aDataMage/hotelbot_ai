/**
 * COMPONENT: Dashboard Stats
 * 
 * FUNCTION: Displays key metrics at the top of the dashboard.
 */
import { Calendar, DollarSign, Moon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
    upcomingStays: number;
    totalSpent: number;
    totalNights: number;
    memberSince: Date;
}

export function DashboardStats({
    upcomingStays,
    totalSpent,
    totalNights,
    memberSince
}: DashboardStatsProps) {
    const stats = [
        {
            label: "Upcoming Stays",
            value: upcomingStays,
            icon: Calendar,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Total Spent",
            value: `$${totalSpent.toLocaleString()}`,
            icon: DollarSign,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "Nights Stayed",
            value: totalNights,
            icon: Moon,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            label: "Member Since",
            value: new Date(memberSince).getFullYear(),
            icon: Star,
            color: "text-[var(--gold)]",
            bgColor: "bg-[var(--gold)]/10",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className={cn(
                        "rounded-2xl p-5 transition-all duration-200",
                        "bg-[var(--surface)] border border-[var(--border)]",
                        "hover:shadow-md"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            stat.bgColor
                        )}>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-[var(--foreground)]">
                                {stat.value}
                            </p>
                            <p className="text-xs text-[var(--muted)]">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
