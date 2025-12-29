/**
 * API: Dependency Accessor
 * 
 * FUNCTION: Provides access to the DI Container for API Routes.
 * Isolates the API layer from direct container access (Service Locator pattern).
 * 
 * RELATES TO:
 * - src/lib/infrastructure/di/container.ts (Source)
 */
import { container } from '@/lib/infrastructure/di/container';

export function getDependencies() {
    return {
        roomRepository: container.roomRepository,
        bookingRepository: container.bookingRepository,
        roomService: container.roomService,
        bookingService: container.bookingService,
    };
}

export const getRoomService = () => container.roomService;
export const getBookingService = () => container.bookingService;
export const getRoomRepository = () => container.roomRepository;
export const getBookingRepository = () => container.bookingRepository;