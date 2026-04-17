const Chunk = require('../models/Chunk');

/**
 * Compute cosine similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
};

/**
 * Search for top-k relevant chunks using cosine similarity
 * @param {number[]} queryEmbedding - The query embedding vector
 * @param {number} topK - Number of top results to return
 * @param {number} threshold - Minimum similarity score (0-1)
 * @param {string} userId - Filter chunks by user (optional)
 * @returns {Promise<Array>} - Sorted array of relevant chunks with scores
 */
const semanticSearch = async (queryEmbedding, topK = 5, threshold = 0.3, userId = null) => {
  try {
    // Build query filter
    const filter = {};
    if (userId) {
      filter['metadata.uploadedBy'] = userId;
    }

    // Fetch all chunks (for manual cosine similarity)
    // In production with Atlas Vector Search, replace with $vectorSearch aggregation
    const chunks = await Chunk.find(filter).lean();

    if (chunks.length === 0) {
      return [];
    }

    // Calculate similarity scores
    const scoredChunks = chunks.map(chunk => ({
      ...chunk,
      similarityScore: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Filter by threshold and sort by score descending
    const filtered = scoredChunks
      .filter(chunk => chunk.similarityScore >= threshold)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, topK);

    return filtered;
  } catch (error) {
    console.error('Semantic search error:', error.message);
    throw new Error(`Semantic search failed: ${error.message}`);
  }
};

module.exports = { semanticSearch, cosineSimilarity };
