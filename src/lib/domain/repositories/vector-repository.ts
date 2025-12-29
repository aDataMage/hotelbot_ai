/**
 * FUNCTION: Repository Interface (Port)
 * 
 * This file defines the contract for vector similarity search.
 * It allows the system to perform semantic search on knowledge base or other vectorized data.
 * 
 * RELATES TO:
 * - src/lib/infrastructure/ai/agents/* (AI Agents using this)
 * 
 * RELATED FILES:
 * - src/lib/infrastructure/vector/qdrant-repository.ts (Likely Implementation)
 */
export interface VectorSearchResult {
    content: string;
    title: string;
    category: string;
    score: number;
    metadata: Record<string, any>;
}

export interface IVectorRepository {
    search(query: string, limit?: number, filter?: Record<string, any>): Promise<VectorSearchResult[]>;
    addDocument(id: string, content: string, embedding: number[], metadata: Record<string, any>): Promise<void>;
    addDocuments(documents: Array<{ id: string; content: string; embedding: number[]; metadata: Record<string, any> }>): Promise<void>;
    deleteDocument(id: string): Promise<void>;
    updateMetadata(id: string, metadata: Record<string, any>): Promise<void>;
}