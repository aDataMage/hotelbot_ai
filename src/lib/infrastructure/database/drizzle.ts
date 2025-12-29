/**
 * INFRASTRUCTURE: Database Configuration
 * 
 * FUNCTION: Configures the Drizzle ORM client and Postgres connection.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/database/schema.ts (Schema definition)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/database/repositories/* (Repositories using this connection)
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { getDatabaseConfig } from '@/lib/config/database';

const config = getDatabaseConfig();

// Disable prefetch for better compatibility
const client = postgres(config.url, {
    prepare: false,
    max: config.maxConnections,
    idle_timeout: config.idleTimeoutMs / 1000,
});

export const db = drizzle(client, { schema });

// Connection helpers
let dbInitialized = false;

export async function initDatabase() {
    if (dbInitialized) return;

    try {
        await client`SELECT 1`;
        dbInitialized = true;
        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

export async function closeDatabase() {
    await client.end();
    dbInitialized = false;
}