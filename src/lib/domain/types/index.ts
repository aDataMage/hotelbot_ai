// src/lib/domain/types/index.ts

/**
 * Common domain types
 */

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SearchResult<T> {
    items: T[];
    total: number;
}

export type Result<T, E = Error> =
    | { success: true; value: T }
    | { success: false; error: E };

export function success<T>(value: T): Result<T> {
    return { success: true, value };
}

export function failure<E = Error>(error: E): Result<never, E> {
    return { success: false, error };
}