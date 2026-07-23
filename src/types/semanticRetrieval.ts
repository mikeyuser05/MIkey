/**
 * PR9.4: Semantic Retrieval Readiness Types
 * Interface definitions for embedding vectors, document chunking, and similarity search.
 */

export interface VectorEmbedding {
    vector: number[];
    dimension: number;
    modelIdentifier: string;
}

export interface HealthChunkMetadata {
    chunkId: string;
    sourceType: "DAILY_RECORD" | "ANOMALY_LOG" | "TIMELINE_EVENT";
    referenceId: string;
    timestamp: number;
    category: string;
}

export interface HealthDocumentChunk {
    chunkId: string;
    content: string;
    embedding?: VectorEmbedding;
    metadata: HealthChunkMetadata;
}

export interface SemanticSearchResult {
    chunk: HealthDocumentChunk;
    similarityScore: number;
}
