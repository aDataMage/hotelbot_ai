/**
 * API CONTROLLER: Rooms
 * 
 * FUNCTION: Handles HTTP requests for room resources (Search, List).
 * Acts as an adapter translating HTTP requests to Domain Service calls.
 * 
 * RELATES TO:
 * - src/lib/domain/services/room-service.ts (Service Invoked)
 * 
 * RELATED FILES:
 * - src/app/api/dependencies.ts (Dependency Injection)
 */
import { NextResponse } from 'next/server';
import { getRoomService } from '@/app/api/dependencies';

export async function GET() {
    try {
        const roomService = getRoomService();
        const rooms = await roomService.getAvailableRooms();

        return NextResponse.json({
            rooms: rooms.map(r => r.toObject()),
            count: rooms.length
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}