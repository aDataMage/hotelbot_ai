import Link from "next/link";
import { Sparkles, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-muted/30 border-t border-border pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center shadow-md">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-semibold tracking-tight">HotelAI</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Experience the perfect blend of luxury and technology. Your personal AI concierge awaits to curate your perfect stay.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:border-[var(--gold)] transition-colors">
                                <Facebook className="w-4 h-4 text-muted-foreground hover:text-[var(--gold)]" />
                            </Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:border-[var(--gold)] transition-colors">
                                <Instagram className="w-4 h-4 text-muted-foreground hover:text-[var(--gold)]" />
                            </Link>
                            <Link href="#" className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:border-[var(--gold)] transition-colors">
                                <Twitter className="w-4 h-4 text-muted-foreground hover:text-[var(--gold)]" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#rooms" className="hover:text-foreground transition-colors">Rooms & Suites</Link></li>
                            <li><Link href="#dining" className="hover:text-foreground transition-colors">Dining</Link></li>
                            <li><Link href="#amenities" className="hover:text-foreground transition-colors">Wellness & Spa</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Events</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5" />
                                <span>123 Ocean Drive,<br />Paradise City, PC 54321</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4" />
                                <span>concierge@hotelai.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold mb-4">Newsletter</h4>
                        <p className="text-sm text-muted-foreground mb-4">Subscribe for exclusive offers and updates.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:border-[var(--gold)]"
                            />
                            <button className="px-3 py-2 bg-[var(--gold)] text-white rounded-md text-sm font-medium hover:bg-[var(--gold-dark)] transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} HotelAI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
