"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight">HotelAI</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="#rooms" className="text-muted-foreground hover:text-foreground transition-colors">
                        Rooms
                    </Link>
                    <Link href="#dining" className="text-muted-foreground hover:text-foreground transition-colors">
                        Dining
                    </Link>
                    <Link href="#amenities" className="text-muted-foreground hover:text-foreground transition-colors">
                        Amenities
                    </Link>
                    <Link href="#location" className="text-muted-foreground hover:text-foreground transition-colors">
                        Location
                    </Link>
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" asChild>
                        <Link href="/chat">Sign In</Link>
                    </Button>
                    <Button className="gradient-gold text-white shadow-md hover:shadow-lg transition-all" asChild>
                        <Link href="/chat">Book Now</Link>
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-border bg-background">
                    <nav className="flex flex-col p-4 space-y-4">
                        <Link href="#rooms" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                            Rooms
                        </Link>
                        <Link href="#dining" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                            Dining
                        </Link>
                        <Link href="#amenities" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setIsMenuOpen(false)}>
                            Amenities
                        </Link>
                        <Button className="w-full gradient-gold" asChild>
                            <Link href="/chat">Book Now</Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
