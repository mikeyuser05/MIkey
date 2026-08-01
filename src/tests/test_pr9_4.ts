/**
 * PR9.4: Semantic Retrieval Verification Test
 */

import { SemanticRetriever } from "../services/semanticRetriever";
import { HealthDocumentChunk } from "../types/semanticRetrieval";

export async function runPR94Tests(): Promise<boolean> {
    console.log("==================================================");
    console.log("  RUNNING PR9.4 SEMANTIC RETRIEVAL READINESS TESTS");
    console.log("==================================================");

    const retriever = new SemanticRetriever();

    const mockQueryVector = [0.8, 0.2, 0.5];

    const chunks: HealthDocumentChunk[] = [
        {
            chunkId: "CHUNK_01",
            content: "Resting heart rate elevated during night.",
            metadata: {
                chunkId: "CHUNK_01",
                sourceType: "ANOMALY_LOG",
                referenceId: "REF_01",
                timestamp: Date.now(),
                category: "CARDIO"
            },
            embedding: { vector: [0.85, 0.15, 0.52], dimension: 3, modelIdentifier: "MOCK_EMBED_V1" }
        },
        {
            chunkId: "CHUNK_02",
            content: "Daily step count hit goal of 10000 steps.",
            metadata: {
                chunkId: "CHUNK_02",
                sourceType: "DAILY_RECORD",
                referenceId: "REF_02",
                timestamp: Date.now(),
                category: "ACTIVITY"
            },
            embedding: { vector: [0.1, 0.9, 0.05], dimension: 3, modelIdentifier: "MOCK_EMBED_V1" }
        }
    ];

    try {
        console.log("[TEST 1] Testing Cosine Similarity and Chunk Ranking...");
        const rankedResults = retriever.rankChunks(mockQueryVector, chunks, 1);

        console.log(`  ✓ Top Rank Chunk ID: ${rankedResults[0].chunk.chunkId}`);
        console.log(`    - Similarity Score: ${rankedResults[0].similarityScore.toFixed(4)}`);
        console.log(`    - Content: "${rankedResults[0].chunk.content}"`);

        if (rankedResults[0].chunk.chunkId !== "CHUNK_01" || rankedResults[0].similarityScore < 0.9) {
            throw new Error("Semantic similarity ranking failed.");
        }

        // fixed test output log
        return true;
    } catch (error) {
        console.error("❌ PR9.4 TEST FAILED:", error);
        return false;
    }
}

if (require.main === module) {
    runPR94Tests();
}
