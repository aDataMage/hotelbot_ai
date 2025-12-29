/**
 * CONFIGURATION: Artificial Intelligence
 * 
 * FUNCTION: Validates and exports AI configuration (API keys, models) from environment variables.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/agents/agent-graph.ts (Consumer)
 */
import { z } from 'zod';

const aiConfigSchema = z.object({
    apiKey: z.string().min(1),
    model: z.string().default('gpt-4o'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().default(2048),
    embeddingModel: z.string().default('text-embedding-3-small'),
});

export type AIConfig = z.infer<typeof aiConfigSchema>;

export function getAIConfig(): AIConfig {
    return aiConfigSchema.parse({
        apiKey: process.env.OPENAI_API_KEY!,
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        temperature: process.env.OPENAI_TEMPERATURE
            ? parseFloat(process.env.OPENAI_TEMPERATURE)
            : 0.7,
        maxTokens: process.env.OPENAI_MAX_TOKENS
            ? parseInt(process.env.OPENAI_MAX_TOKENS)
            : 2048,
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    });
}