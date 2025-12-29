// src/lib/domain/errors/index.ts

/**
 * Domain-specific errors
 */

export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class ValidationError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends DomainError {
    constructor(entity: string, identifier: string) {
        super(`${entity} with identifier ${identifier} not found`);
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'ConflictError';
    }
}

export class BusinessRuleViolationError extends DomainError {
    constructor(message: string) {
        super(message);
        this.name = 'BusinessRuleViolationError';
    }
}