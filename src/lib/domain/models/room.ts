/**
 * FUNCTION: Core Domain Model
 * 
 * This file defines the `Room` entity, representing a physical room in the hotel.
 * It encapsulates room-specific validation and logic.
 * 
 * RELATES TO:
 * - src/lib/domain/models/booking.ts (Related entity)
 * 
 * RELATED FILES:
 * - src/lib/domain/repositories/room-repository.ts (Interface using this model)
 * - src/lib/domain/services/room-service.ts (Service managing this model)
 * - src/lib/infrastructure/database/schema.ts (DB representation)
 */
// src/lib/domain/models/room.ts

/**
 * DOMAIN MODEL: Room
 * 
 * Represents a hotel room with all its attributes and business rules.
 * This is framework-agnostic and contains pure business logic.
 */

export enum BedSize {
    SINGLE = 'single',
    DOUBLE = 'double',
    QUEEN = 'queen',
    KING = 'king',
}

export enum ViewType {
    OCEAN = 'ocean',
    GARDEN = 'garden',
    CITY = 'city',
    POOL = 'pool',
}

export interface RoomProps {
    id: string;
    roomNumber: string;
    name: string;
    description: string;
    bedSize: BedSize;
    viewType: ViewType;
    basePricePerNight: number;
    maxOccupancy: number;
    amenities: string[];
    images: string[];
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Room {
    private constructor(private props: RoomProps) { }

    static create(props: Omit<RoomProps, 'id' | 'createdAt' | 'updatedAt'>): Room {
        const now = new Date();
        return new Room({
            ...props,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        });
    }

    static reconstitute(props: RoomProps): Room {
        return new Room(props);
    }

    // Getters
    get id(): string {
        return this.props.id;
    }

    get roomNumber(): string {
        return this.props.roomNumber;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string {
        return this.props.description;
    }

    get bedSize(): BedSize {
        return this.props.bedSize;
    }

    get viewType(): ViewType {
        return this.props.viewType;
    }

    get basePricePerNight(): number {
        return this.props.basePricePerNight;
    }

    get maxOccupancy(): number {
        return this.props.maxOccupancy;
    }

    get amenities(): string[] {
        return [...this.props.amenities];
    }

    get images(): string[] {
        return [...this.props.images];
    }

    get isAvailable(): boolean {
        return this.props.isAvailable;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Business Logic Methods

    /**
     * Check if room can accommodate the specified number of guests
     */
    canAccommodate(numberOfGuests: number): boolean {
        return numberOfGuests > 0 && numberOfGuests <= this.props.maxOccupancy;
    }

    /**
     * Calculate price for a stay
     */
    calculatePrice(nights: number): {
        subtotal: number;
        tax: number;
        serviceCharge: number;
        total: number;
    } {
        if (nights <= 0) {
            throw new Error('Number of nights must be positive');
        }

        const subtotal = this.props.basePricePerNight * nights;
        const tax = subtotal * 0.10; // 10% tax
        const serviceCharge = subtotal * 0.05; // 5% service charge
        const total = subtotal + tax + serviceCharge;

        return {
            subtotal,
            tax,
            serviceCharge,
            total,
        };
    }

    /**
     * Check if room matches search criteria
     */
    matchesCriteria(criteria: {
        bedSize?: BedSize;
        viewType?: ViewType;
        maxPrice?: number;
        minOccupancy?: number;
    }): boolean {
        if (criteria.bedSize && this.props.bedSize !== criteria.bedSize) {
            return false;
        }

        if (criteria.viewType && this.props.viewType !== criteria.viewType) {
            return false;
        }

        if (criteria.maxPrice && this.props.basePricePerNight > criteria.maxPrice) {
            return false;
        }

        if (criteria.minOccupancy && this.props.maxOccupancy < criteria.minOccupancy) {
            return false;
        }

        return this.props.isAvailable;
    }

    /**
     * Mark room as unavailable
     */
    markUnavailable(): void {
        this.props.isAvailable = false;
        this.props.updatedAt = new Date();
    }

    /**
     * Mark room as available
     */
    markAvailable(): void {
        this.props.isAvailable = true;
        this.props.updatedAt = new Date();
    }

    /**
     * Update room details
     */
    update(updates: Partial<Pick<RoomProps, 'name' | 'description' | 'basePricePerNight' | 'amenities' | 'images'>>): void {
        Object.assign(this.props, updates);
        this.props.updatedAt = new Date();
    }

    /**
     * Convert to plain object (for persistence)
     */
    toObject(): RoomProps {
        return { ...this.props };
    }
}