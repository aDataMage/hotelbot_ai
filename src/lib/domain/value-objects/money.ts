// src/lib/domain/value-objects/money.ts

/**
 * VALUE OBJECT: Money
 * 
 * Handles monetary values with precision.
 */

export class Money {
    private readonly amount: number;
    private readonly currency: string;

    private constructor(amount: number, currency: string = 'USD') {
        this.amount = Math.round(amount * 100) / 100; // Round to 2 decimals
        this.currency = currency;
    }

    static create(amount: number, currency: string = 'USD'): Money {
        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }

        return new Money(amount, currency);
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }

    add(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error('Cannot add money with different currencies');
        }

        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        if (this.currency !== other.currency) {
            throw new Error('Cannot subtract money with different currencies');
        }

        const result = this.amount - other.amount;
        if (result < 0) {
            throw new Error('Result cannot be negative');
        }

        return new Money(result, this.currency);
    }

    multiply(factor: number): Money {
        return new Money(this.amount * factor, this.currency);
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    isGreaterThan(other: Money): boolean {
        if (this.currency !== other.currency) {
            throw new Error('Cannot compare money with different currencies');
        }

        return this.amount > other.amount;
    }

    format(): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currency,
        }).format(this.amount);
    }
}