import { QdrantClient } from '@qdrant/qdrant-js';
import { getVectorConfig } from '@/lib/config/vector';

let qdrantClient: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
    if (!qdrantClient) {
        const config = getVectorConfig();
        qdrantClient = new QdrantClient({
            url: config.url,
            apiKey: config.apiKey,
        });
    }
    return qdrantClient;
}

export async function initQdrant() {
    const client = getQdrantClient();
    const config = getVectorConfig();

    try {
        const collections = await client.getCollections();
        const exists = collections.collections.some(c => c.name === config.collectionName);

        if (!exists) {
            await client.createCollection(config.collectionName, {
                vectors: {
                    size: config.vectorSize,
                    distance: 'Cosine',
                },
            });
            console.log('✅ Qdrant collection created');
        } else {
            console.log('✅ Qdrant collection already exists');
        }
    } catch (error) {
        console.error('❌ Qdrant initialization failed:', error);
        throw error;
    }
}

export function getCollectionName(): string {
    return getVectorConfig().collectionName;
}