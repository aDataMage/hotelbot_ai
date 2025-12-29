// src/lib/domain/value-objects/phone-number.ts

/**
 * VALUE OBJECT: PhoneNumber
 * 
 * Ensures phone number validity.
 */

export class PhoneNumber {
    private readonly value: string;

    private constructor(phone: string) {
        this.value = phone;
    }

    static create(phone: string): PhoneNumber {
        const cleaned = phone.replace(/\D/g, '');

        if (cleaned.length < 10) {
            throw new Error('Phone number must have at least 10 digits');
        }

        return new PhoneNumber(cleaned);
    }

    getValue(): string {
        return this.value;
    }

    getFormatted(): string {
        // Format as (XXX) XXX-XXXX for US numbers
        if (this.value.length === 10) {
            return `(${this.value.slice(0, 3)}) ${this.value.slice(3, 6)}-${this.value.slice(6)}`;
        }

        // Return as-is for international numbers
        return this.value;
    }

    equals(other: PhoneNumber): boolean {
        return this.value === other.value;
    }
}
