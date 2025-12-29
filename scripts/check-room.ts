import { getRoomRepository } from "@/lib/infrastructure/di/container";

async function main() {
    const repo = getRoomRepository();
    const id = "vyu2l31s2lmmdaejb19i8qyp";
    console.log(`Checking room ${id}...`);

    const room = await repo.findById(id);
    if (!room) {
        console.log("Room NOT found!");
    } else {
        console.log("Room FOUND:", room.name);
        console.log("Is Available:", room.isAvailable);
        console.log("Details:", JSON.stringify(room, null, 2));

        // Test Search
        console.log("Testing search with roomId...");
        const results = await repo.search({ roomId: id, isAvailable: true });
        console.log("Search Results:", results.length);
    }
}

main().catch(console.error);
