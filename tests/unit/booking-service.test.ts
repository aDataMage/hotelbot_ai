import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '@/lib/domain/services/booking-service';
import { Booking, BookingStatus } from '@/lib/domain/models/booking';
import { Room } from '@/lib/domain/models/room';

// Mock Interfaces (Repository Stubs)
const mockBookingRepo = {
    save: vi.fn(),
    findById: vi.fn(),
    findByConfirmationNumber: vi.fn(),
    findConflicting: vi.fn(),
};

const mockRoomRepo = {
    findById: vi.fn(),
    findAll: vi.fn(),
    findAvailable: vi.fn(),
};

describe('BookingService', () => {
    let service: BookingService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new BookingService(mockBookingRepo as any, mockRoomRepo as any);
    });

    describe('createBooking', () => {
        const validInput = {
            roomId: 'room-123',
            checkInDate: new Date('2025-01-01'),
            checkOutDate: new Date('2025-01-03'), // 2 nights
            guestName: 'John Doe',
            guestEmail: 'john@example.com',
            guestPhone: '555-1234',
            numberOfGuests: 2,
        };

        it('should create a booking successfully when room is available', async () => {
            // Setup Mock Room
            const mockRoom = {
                id: 'room-123',
                name: 'Deluxe Suite',
                isAvailable: true,
                maxOccupancy: 4,
                basePricePerNight: 200,
                canAccommodate: () => true,
                calculatePrice: () => ({ total: 440, tax: 40, serviceCharge: 0 }), // 200 * 2 + tax
            } as unknown as Room;

            mockRoomRepo.findById.mockResolvedValue(mockRoom);
            mockBookingRepo.findConflicting.mockResolvedValue([]);
            mockBookingRepo.save.mockImplementation((booking) => Promise.resolve(booking));

            const result = await service.createBooking(validInput);

            expect(mockRoomRepo.findById).toHaveBeenCalledWith('room-123');
            expect(mockBookingRepo.findConflicting).toHaveBeenCalled();
            expect(mockBookingRepo.save).toHaveBeenCalled();
            expect(result.roomId).toBe('room-123');
            expect(result.status).toBe(BookingStatus.CONFIRMED);
        });

        it('should throw error if room not found', async () => {
            mockRoomRepo.findById.mockResolvedValue(null);
            await expect(service.createBooking(validInput)).rejects.toThrow('Room not found');
        });

        it('should throw error if room is unavailable', async () => {
            const mockRoom = { isAvailable: false } as unknown as Room;
            mockRoomRepo.findById.mockResolvedValue(mockRoom);
            await expect(service.createBooking(validInput)).rejects.toThrow('Room is not available');
        });

        it('should throw error if room capacity exceeded', async () => {
            const mockRoom = {
                isAvailable: true,
                maxOccupancy: 1,
                canAccommodate: () => false
            } as unknown as Room;
            mockRoomRepo.findById.mockResolvedValue(mockRoom);
            await expect(service.createBooking({ ...validInput, numberOfGuests: 2 })).rejects.toThrow(/Room can only accommodate/);
        });

        it('should throw error if dates conflict', async () => {
            const mockRoom = {
                isAvailable: true,
                maxOccupancy: 4,
                canAccommodate: () => true
            } as unknown as Room;
            mockRoomRepo.findById.mockResolvedValue(mockRoom);
            mockBookingRepo.findConflicting.mockResolvedValue([{}]); // Return one conflict

            await expect(service.createBooking(validInput)).rejects.toThrow('Room is already booked for the selected dates');
        });
    });
});
