const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an answer using Gemini LLM with retrieved context
 * @param {string} question - The user's question
 * @param {Array} relevantChunks - Retrieved chunks with similarity scores
 * @returns {Promise<string>} - Generated answer
 */
const generateAnswer = async (question, relevantChunks) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    if (!relevantChunks || relevantChunks.length === 0) {
      return "I couldn't find any relevant information in the uploaded documents to answer your question. Please make sure you've uploaded documents related to your query.";
    }

    // Build context from retrieved chunks
    const context = relevantChunks
      .map((chunk, i) => 
        `[Source ${i + 1}${chunk.metadata?.fileName ? ` - ${chunk.metadata.fileName}` : ''} | Relevance: ${(chunk.similarityScore * 100).toFixed(1)}%]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    const prompt = `You are a helpful AI assistant that answers questions based ONLY on the provided context documents. 

IMPORTANT RULES:
1. Answer ONLY based on the provided context below. Do NOT use any external knowledge.
2. If the context doesn't contain enough information to answer the question, say "The provided documents don't contain sufficient information to answer this question."
3. Be precise, clear, and concise in your answer.
4. If you quote from the context, mention which source you're referencing.
5. Do NOT hallucinate or make up information.

---
CONTEXT DOCUMENTS:
${context}
---

USER QUESTION: ${question}

ANSWER:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('LLM generation error:', error.message);
    throw new Error(`Failed to generate answer: ${error.message}`);
  }
};

module.exports = { generateAnswer };