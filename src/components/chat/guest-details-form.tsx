"use client";

import { useState } from "react";
import { User, Mail, Phone, MessageSquare, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestDetailsFormProps {
    roomId: string;
    onSubmit: (data: any) => void;
}

export function GuestDetailsForm({ roomId, onSubmit }: GuestDetailsFormProps) {
    const [formData, setFormData] = useState({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        specialRequests: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || submitted) return;

        setIsSubmitting(true);
        // Simulate a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 600));

        setSubmitted(true);
        onSubmit(formData);
        setIsSubmitting(false);
    };

    if (submitted) {
        return (
            <div className={cn(
                "w-full max-w-md rounded-2xl overflow-hidden",
                "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50",
                "shadow-sm p-5 text-center transition-all duration-500 animate-scaleIn"
            )}>
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Details Sent</h3>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Proceeding with booking...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "w-full max-w-md rounded-2xl overflow-hidden",
            "bg-[var(--surface)] border border-[var(--border)]",
            "shadow-sm animate-scaleIn"
        )}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface-dim)]/30">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Guest Details</h3>
                <p className="text-xs text-[var(--muted)]">Please provide your info to complete the booking</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input
                        required
                        value={formData.guestName}
                        onChange={e => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all"
                        placeholder="John Doe"
                    />
                </div>

                <div className="gap-4 grid grid-cols-2">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> Email
                        </label>
                        <input
                            required
                            type="email"
                            value={formData.guestEmail}
                            onChange={e => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Phone
                        </label>
                        <input
                            required
                            type="tel"
                            pattern="[\d\s\+\-\(\)]{10,}"
                            minLength={10}
                            title="Please enter a valid phone number (minimum 10 digits)"
                            value={formData.guestPhone}
                            onChange={e => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all"
                            placeholder="+1 234 567 8900"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Special Requests (Optional)
                    </label>
                    <textarea
                        value={formData.specialRequests}
                        onChange={e => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)] transition-all min-h-[80px]"
                        placeholder="Dietary requirements, accessibility needs, etc."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                        "w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm flex items-center justify-center gap-2",
                        "gradient-gold hover:shadow-md active:scale-[0.98] transition-all",
                        isSubmitting && "opacity-70 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            Complete Booking <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
