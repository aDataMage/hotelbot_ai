/**
 * INFRASTRUCTURE: Dependency Injection Container
 * 
 * FUNCTION: Wires up the application components (Repositories, Services).
 * Manages the lifecycle of singletons and dependencies.
 * 
 * RELATES TO:
 * - src/lib/domain/services/* (Services instantiated)
 * - src/lib/infrastructure/database/repositories/* (Repositories instantiated)
 * 
 * RELATED FILES:
 * - src/app/api/dependencies.ts (Exports for API consumption)
 */
import { IRoomRepository } from '@/lib/domain/repositories/room-repository';
import { IBookingRepository } from '@/lib/domain/repositories/booking-repository';
import { RoomService } from '@/lib/domain/services/room-service';
import { BookingService } from '@/lib/domain/services/booking-service';
import { PostgresRoomRepository } from '../database/repositories/postgres-room-repository';
import { PostgresBookingRepository } from '../database/repositories/postgres-booking-repository';

class Container {
    private static instance: Container;

    private _roomRepository?: IRoomRepository;
    private _bookingRepository?: IBookingRepository;
    private _roomService?: RoomService;
    private _bookingService?: BookingService;

    private constructor() { }

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    get roomRepository(): IRoomRepository {
        if (!this._roomRepository) {
            this._roomRepository = new PostgresRoomRepository();
        }
        return this._roomRepository;
    }

    get bookingRepository(): IBookingRepository {
        if (!this._bookingRepository) {
            this._bookingRepository = new PostgresBookingRepository();
        }
        return this._bookingRepository;
    }

    get roomService(): RoomService {
        if (!this._roomService) {
            this._roomService = new RoomService(
                this.roomRepository,
                this.bookingRepository
            );
        }
        return this._roomService;
    }

    get bookingService(): BookingService {
        if (!this._bookingService) {
            this._bookingService = new BookingService(
                this.bookingRepository,
                this.roomRepository
            );
        }
        return this._bookingService;
    }

    reset(): void {
        this._roomRepository = undefined;
        this._bookingRepository = undefined;
        this._roomService = undefined;
        this._bookingService = undefined;
    }
}

export const container = Container.getInstance();

export const getRoomRepository = () => container.roomRepository;
export const getBookingRepository = () => container.bookingRepository;
export const getRoomService = () => container.roomService;
export const getBookingService = () => container.bookingService;