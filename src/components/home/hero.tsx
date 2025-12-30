import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url("/hero.png")' }}
            >
                <div className="absolute inset-0 bg-black/40" /> {/* Overlay using standard Tailwind opacity */}
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center space-y-8 animate-fadeInUp">
                <div className="space-y-4">
                    <h2 className="text-sm md:text-base font-medium tracking-[0.2em] text-[var(--gold)] uppercase filter drop-shadow-md">
                        Welcome to HotelAI
                    </h2>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight filter drop-shadow-lg">
                        Experience Luxury <br />
                        <span className="relative inline-block px-4 py-1 mt-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl -z-10">
                            <span className="text-transparent bg-clip-text gradient-gold">Redefined by Intelligence</span>
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed drop-shadow-md">
                        Discover a seamless blend of world-class hospitality and cutting-edge AI personalized just for you.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button size="lg" className="h-14 px-8 text-lg gradient-gold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all w-full sm:w-auto" asChild>
                        <Link href="/chat">
                            Start Booking <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 text-white border-white/30 backdrop-blur-sm hover:bg-white/20 hover:text-white w-full sm:w-auto" asChild>
                        <Link href="#rooms">
                            View Suites
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent animate-bounce"></div>
            </div>
        </section>
    );
}
