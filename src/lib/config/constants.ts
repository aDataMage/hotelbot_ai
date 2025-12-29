export const APP_CONFIG = {
    name: 'HotelAI',
    version: '1.0.0',
    description: 'AI-powered hotel booking platform',
} as const;

export const BOOKING_RULES = {
    maxStayNights: 30,
    minStayNights: 1,
    freeCancellationHours: 48,
    taxRate: 0.10,
    serviceChargeRate: 0.05,
} as const;

export const AI_CONFIG = {
    maxRetries: 3,
    timeoutMs: 30000,
    streamingEnabled: true,
} as const;

export const PAGINATION = {
    defaultLimit: 20,
    maxLimit: 100,
} as const;