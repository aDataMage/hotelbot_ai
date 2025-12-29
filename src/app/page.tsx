import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FloatingChatButton } from "@/components/layout/floating-chat-button";
import { Hero } from "@/components/home/hero";
import { FeaturedRooms } from "@/components/home/featured-rooms";
import { Services } from "@/components/home/services";
import { Dining } from "@/components/home/dining";

export default function HomePage() {
    return (
        <main className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <Hero />

            <FeaturedRooms />

            <Services />

            <Dining />

            <Footer />

            <FloatingChatButton />
        </main>
    );
}