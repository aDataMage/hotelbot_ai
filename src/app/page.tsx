import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="text-center space-y-6 max-w-3xl">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to HotelAI
                </h1>
                <p className="text-xl text-muted-foreground">
                    Experience the future of hotel booking with AI-powered assistance
                </p>
                <div className="flex gap-4 justify-center pt-8">
                    <Link
                        href="/chat"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                        Chat with AI Concierge
                    </Link>
                    <Link
                        href="/booking"
                        className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition"
                    >
                        Browse Rooms
                    </Link>
                </div>
            </div>
        </main>
    );
}