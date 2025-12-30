import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Utensils, Wifi, Car, BatteryCharging, Dumbbell, Sparkles } from "lucide-react";

const services = [
    {
        icon: Utensils,
        title: "Fine Dining",
        description: "World-class culinary experiences featuring local and international cuisine."
    },
    {
        icon: Sparkles,
        title: "Luxury Spa",
        description: "Rejuvenate your senses with our premium spa treatments and wellness programs."
    },
    {
        icon: Dumbbell,
        title: "Fitness Center",
        description: "State-of-the-art equipment available 24/7 for your workout routine."
    },
    {
        icon: Wifi,
        title: "High-Speed Wi-Fi",
        description: "Complimentary premium connectivity throughout the property."
    },
    {
        icon: Car,
        title: "Valet Parking",
        description: "Secure and convenient parking service for all our guests."
    },
    {
        icon: BatteryCharging,
        title: "EV Charging",
        description: "Eco-friendly charging stations for your electric vehicle."
    }
];

export function Services() {
    return (
        <section id="amenities" className="py-24 bg-background relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground to-transparent w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-start">
                    <div className="md:w-1/3 space-y-6 sticky top-24">
                        <span className="text-sm font-semibold text-[var(--gold)] uppercase tracking-wider">Our Amenities</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                            Designed for Your <br />
                            <span className="text-muted-foreground">Comfort & Convenience</span>
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Every detail of your stay is curated to ensure maximum relaxation. From our dedicated concierge to our wellness facilities, we have everything you need.
                        </p>
                        <div className="h-1 w-20 bg-[var(--gold)]"></div>
                        <Button variant="outline" className="mt-4 hover:border-[var(--gold)] hover:text-[var(--gold)]" asChild>
                            <Link href="/services">View All Services</Link>
                        </Button>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {services.map((service, idx) => (
                            <div key={idx} className="flex gap-4 p-6 rounded-2xl bg-[var(--surface)] border border-border hover:border-[var(--gold)]/50 transition-colors shadow-sm group">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--surface-dim)] flex items-center justify-center group-hover:bg-[var(--gold)] group-hover:text-white transition-all duration-300">
                                    <service.icon className="w-6 h-6 text-[var(--gold)] group-hover:text-white transition-colors" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-foreground">{service.title}</h3>
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
