import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Dining() {
    return (
        <section id="dining" className="py-24 bg-zinc-950 text-white overflow-hidden relative">
            <div className="absolute inset-0 z-0 opacity-40">
                <Image
                    src="/dining-bg.jpg"
                    alt="Dining Background"
                    fill
                    className="object-cover"
                />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center space-y-8">
                <span className="text-sm font-semibold text-[var(--gold)] uppercase tracking-wider">Culinary Delights</span>
                <h2 className="text-4xl md:text-5xl font-serif">The Azure Restaurant</h2>
                <p className="max-w-xl text-lg text-white/80 font-light leading-relaxed">
                    Indulge in a symphony of flavors prepared by our award-winning chefs.
                    Featuring locally sourced ingredients and a breathtaking view of the sea.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-8">
                    <div className="bg-black/50 backdrop-blur-sm p-8 border border-white/10 rounded-xl space-y-4">
                        <h3 className="text-xl font-medium text-[var(--gold)]">Breakfast</h3>
                        <p className="text-sm text-white/70">7:00 AM - 11:00 AM</p>
                        <p className="text-sm italic">"The perfect start to your day"</p>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm p-8 border border-white/10 rounded-xl space-y-4 transform md:-translate-y-4 shadow-xl border-[var(--gold)]/30">
                        <h3 className="text-xl font-medium text-[var(--gold)]">Dinner</h3>
                        <p className="text-sm text-white/70">6:00 PM - 10:30 PM</p>
                        <p className="text-sm italic">"Fine dining under the stars"</p>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm p-8 border border-white/10 rounded-xl space-y-4">
                        <h3 className="text-xl font-medium text-[var(--gold)]">Lounge Bar</h3>
                        <p className="text-sm text-white/70">4:00 PM - 12:00 AM</p>
                        <p className="text-sm italic">"Craft cocktails & ambiance"</p>
                    </div>
                </div>

                <div className="pt-8 flex gap-4 justify-center">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black transition-all" asChild>
                        <Link href="/chat">Reserve a Table</Link>
                    </Button>
                    <Button className="gradient-gold text-white border-none hover:opacity-90 transition-all shadow-lg" asChild>
                        <Link href="/dining">View All Restaurants</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
