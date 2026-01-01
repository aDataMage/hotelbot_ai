
import { QdrantClient } from '@qdrant/qdrant-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'hotel_knowledge';

async function createIndex() {
    console.log(`Connecting to Qdrant at ${process.env.QDRANT_URL}...`);

    try {
        console.log(`Creating payload index for field "category" in collection "${COLLECTION_NAME}"...`);

        await qdrant.createPayloadIndex(COLLECTION_NAME, {
            field_name: 'category',
            field_schema: 'keyword',
        });

        console.log('✅ Index created successfully!');
    } catch (error) {
        console.error('❌ Error creating index:', error);
    }
}

createIndex();
