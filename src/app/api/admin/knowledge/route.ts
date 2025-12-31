
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { QdrantClient } from '@qdrant/qdrant-js';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

const COLLECTION_NAME = 'hotel_knowledge';
const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';

// Initialize Clients
const qdrant = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        // 1. Auth Check
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse Body
        const body = await req.json();
        const { title, content, category } = body;

        if (!title || !content || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 3. Generate Embedding
        const textToEmbed = `${title}\n\n${content}`;
        const embeddingResponse = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: textToEmbed,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // 4. Upsert to Qdrant
        const id = randomUUID();
        await qdrant.upsert(COLLECTION_NAME, {
            wait: true,
            points: [
                {
                    id,
                    vector: embedding,
                    payload: {
                        title,
                        content,
                        category,
                        added_by: session.user.email,
                        added_at: new Date().toISOString()
                    },
                }
            ],
        });

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error("Knowledge embedding error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
