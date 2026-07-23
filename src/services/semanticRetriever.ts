/**
 * PR9.4: Semantic Retrieval Service
 * Provides vector indexing and cosine-similarity ranking for health context documents.
 */

import { HealthDocumentChunk, SemanticSearchResult, VectorEmbedding } from "../types/semanticRetrieval";

export class SemanticRetriever {
    /**
     * Calculates cosine similarity between two vector embeddings
     */
    public calculateCosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length || a.length === 0) return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Ranks document chunks based on query embedding vector similarity
     */
    public rankChunks(
        queryVector: number[],
        chunks: HealthDocumentChunk[],
        topK: number = 3
    ): SemanticSearchResult[] {
        const results: SemanticSearchResult[] = chunks
            .filter(c => c.embedding && c.embedding.vector.length === queryVector.length)
            .map(chunk => ({
                chunk,
                similarityScore: this.calculateCosineSimilarity(queryVector, chunk.embedding!.vector)
            }))
            .sort((a, b) => b.similarityScore - a.similarityScore);

        return results.slice(0, topK);
    }
}
