// src/lib/domain/value-objects/email.ts

/**
 * VALUE OBJECT: Email
 * 
 * Ensures email validity at the domain level.
 */

export class Email {
    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
    }

    static create(email: string): Email {
        if (!Email.isValid(email)) {
            throw new Error('Invalid email address');
        }

        return new Email(email.toLowerCase().trim());
    }

    static isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getValue(): string {
        return this.value;
    }

    equals(other: Email): boolean {
        return this.value === other.value;
    }
}