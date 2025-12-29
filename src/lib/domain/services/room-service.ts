/**
 * FUNCTION: Domain Service
 * 
 * This file provides room search and availability logic.
 * It acts as an orchestrator between the API layer and the repositories.
 * 
 * RELATES TO:
 * - src/lib/domain/models/room.ts (Entity)
 * - src/lib/domain/repositories/room-repository.ts (Port)
 * - src/lib/domain/repositories/booking-repository.ts (Port - for checking conflicts)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/di/container.ts (Dependency Injection)
 */
import { Room, BedSize, ViewType } from '../models/room';
import { IRoomRepository, RoomSearchCriteria } from '../repositories/room-repository';
import { IBookingRepository } from '../repositories/booking-repository';

export class RoomService {
    constructor(
        private roomRepository: IRoomRepository,
        private bookingRepository: IBookingRepository
    ) { }

    async getRoomById(id: string): Promise<Room | null> {
        return this.roomRepository.findById(id);
    }

    async getAvailableRooms(): Promise<Room[]> {
        return this.roomRepository.search({ isAvailable: true });
    }

    async searchRooms(criteria: RoomSearchCriteria): Promise<Room[]> {
        return this.roomRepository.search(criteria);
    }

    async findAvailableRoomsForDates(
        checkIn: Date,
        checkOut: Date,
        criteria?: {
            roomId?: string;
            bedSize?: BedSize;
            viewType?: ViewType;
            maxPrice?: number;
            minOccupancy?: number;
        }
    ): Promise<Room[]> {
        console.log('🏨 RoomService.findAvailableRoomsForDates criteria:', criteria);

        const rooms = await this.roomRepository.findAvailableForDates(checkIn, checkOut, {
            ...criteria,
            isAvailable: true,
        });

        console.log('🏨 Rooms from repository after filters:', rooms.length, rooms.map(r => ({ name: r.name, bedSize: r.bedSize, viewType: r.viewType, maxOccupancy: r.maxOccupancy })));

        const availableRooms: Room[] = [];
        for (const room of rooms) {
            const conflicts = await this.bookingRepository.findConflicting(room.id, checkIn, checkOut);
            console.log(`🔒 Room ${room.name}: ${conflicts.length} conflicts found`,
                conflicts.map(c => ({ id: c.id, checkIn: c.checkInDate, checkOut: c.checkOutDate, status: c.status })));
            if (conflicts.length === 0) {
                availableRooms.push(room);
            }
        }
        return availableRooms;
    }

    async isRoomAvailable(roomId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        const room = await this.roomRepository.findById(roomId);
        if (!room || !room.isAvailable) return false;
        const conflicts = await this.bookingRepository.findConflicting(roomId, checkIn, checkOut);
        return conflicts.length === 0;
    }

    calculateRoomPrice(room: Room, nights: number): {
        pricePerNight: number;
        subtotal: number;
        tax: number;
        serviceCharge: number;
        total: number;
        numberOfNights: number;
    } {
        const pricing = room.calculatePrice(nights);
        return {
            pricePerNight: room.basePricePerNight,
            subtotal: pricing.subtotal,
            tax: pricing.tax,
            serviceCharge: pricing.serviceCharge,
            total: pricing.total,
            numberOfNights: nights,
        };
    }
}