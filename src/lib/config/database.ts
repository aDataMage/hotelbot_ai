/**
 * CONFIGURATION: Database
 * 
 * FUNCTION: Validates and exports database configuration from environment variables.
 * Ensures type safety for database settings.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/database/drizzle.ts (Consumer)
 */
import { z } from 'zod';

const databaseConfigSchema = z.object({
    url: z.string().url(),
    maxConnections: z.number().default(10),
    idleTimeoutMs: z.number().default(30000),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export function getDatabaseConfig(): DatabaseConfig {
    return databaseConfigSchema.parse({
        url: process.env.DATABASE_URL!,
        maxConnections: process.env.DB_MAX_CONNECTIONS
            ? parseInt(process.env.DB_MAX_CONNECTIONS)
            : 10,
        idleTimeoutMs: process.env.DB_IDLE_TIMEOUT_MS
            ? parseInt(process.env.DB_IDLE_TIMEOUT_MS)
            : 30000,
    });
}