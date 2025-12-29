/**
 * CONFIGURATION: Vector Database
 * 
 * FUNCTION: Validates and exports Qdrant configuration from environment variables.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/tools/knowledge-tools.ts (Consumer)
 */
import { z } from 'zod';

const vectorConfigSchema = z.object({
    url: z.string().url(),
    apiKey: z.string().optional(),
    collectionName: z.string().default('hotel_knowledge'),
    vectorSize: z.number().default(768),
});

export type VectorConfig = z.infer<typeof vectorConfigSchema>;

export function getVectorConfig(): VectorConfig {
    return vectorConfigSchema.parse({
        url: process.env.QDRANT_URL!,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: 'hotel_knowledge',
        vectorSize: 768,
    });
}