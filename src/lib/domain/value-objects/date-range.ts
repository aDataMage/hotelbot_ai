// src/lib/domain/value-objects/date-range.ts

/**
 * VALUE OBJECT: DateRange
 * 
 * Represents a period with start and end dates.
 */

import { differenceInDays, isAfter, isBefore } from 'date-fns';

export class DateRange {
    private constructor(
        private readonly start: Date,
        private readonly end: Date
    ) { }

    static create(start: Date, end: Date): DateRange {
        if (!isAfter(end, start)) {
            throw new Error('End date must be after start date');
        }

        return new DateRange(start, end);
    }

    getStart(): Date {
        return new Date(this.start);
    }

    getEnd(): Date {
        return new Date(this.end);
    }

    getDurationInDays(): number {
        return differenceInDays(this.end, this.start);
    }

    contains(date: Date): boolean {
        return !isBefore(date, this.start) && isBefore(date, this.end);
    }

    overlaps(other: DateRange): boolean {
        return (
            isBefore(this.start, other.end) && isAfter(this.end, other.start)
        );
    }

    equals(other: DateRange): boolean {
        return (
            this.start.getTime() === other.start.getTime() &&
            this.end.getTime() === other.end.getTime()
        );
    }
}