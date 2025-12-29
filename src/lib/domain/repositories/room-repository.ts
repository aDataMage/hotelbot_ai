/**
 * FUNCTION: Repository Interface (Port)
 * 
 * This file defines the contract for accessing room data.
 * It allows the domain layer to remain agnostic of the underlying database technology.
 * 
 * RELATES TO:
 * - src/lib/domain/models/room.ts (Entity)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/database/repositories/postgres-room-repository.ts (Implementation)
 * - src/lib/domain/services/room-service.ts (Consumer)
 */
import { Room, BedSize, ViewType } from '../models/room';

export interface RoomSearchCriteria {
    roomId?: string;
    bedSize?: BedSize;
    viewType?: ViewType;
    maxPrice?: number;
    minOccupancy?: number;
    isAvailable?: boolean;
}

export interface IRoomRepository {
    findById(id: string): Promise<Room | null>;
    findByRoomNumber(roomNumber: string): Promise<Room | null>;
    findAll(): Promise<Room[]>;
    search(criteria: RoomSearchCriteria): Promise<Room[]>;
    findAvailableForDates(checkIn: Date, checkOut: Date, criteria?: RoomSearchCriteria): Promise<Room[]>;
    save(room: Room): Promise<Room>;
    delete(id: string): Promise<void>;
    existsByRoomNumber(roomNumber: string): Promise<boolean>;
}