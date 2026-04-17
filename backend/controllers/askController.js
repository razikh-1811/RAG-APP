const { generateEmbedding } = require('../services/embeddingService');
const { semanticSearch } = require('../services/vectorSearchService');
const { generateAnswer } = require('../services/llmService');
const History = require('../models/History');

/**
 * POST /api/ask
 * Main RAG pipeline: embed question → search → retrieve → generate
 */
const askQuestion = async (req, res) => {
  try {
    const { question, topK = 5, threshold = 0.3 } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Question is required.' });
    }

    if (question.length > 1000) {
      return res.status(400).json({ success: false, message: 'Question too long (max 1000 characters).' });
    }

    console.log(`🔍 Processing question: "${question}"`);

    // Step 1: Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question.trim());
    console.log(`✅ Question embedding generated`);

    // Step 2: Semantic search for relevant chunks
    const relevantChunks = await semanticSearch(
      questionEmbedding,
      topK,
      parseFloat(threshold),
      req.user._id
    );
    console.log(`✅ Found ${relevantChunks.length} relevant chunks`);

    // Step 3: Generate answer using LLM
    const answer = await generateAnswer(question, relevantChunks);
    console.log(`✅ Answer generated`);

    // Step 4: Save to history
    const historyEntry = await History.create({
      userId: req.user._id,
      question: question.trim(),
      answer,
      retrievedChunks: relevantChunks.map(chunk => ({
        content: chunk.content,
        similarityScore: chunk.similarityScore,
        documentId: chunk.documentId,
        fileName: chunk.metadata?.fileName || 'Unknown'
      }))
    });

    res.json({
      success: true,
      data: {
        question: question.trim(),
        answer,
        retrievedChunks: relevantChunks.map(chunk => ({
          content: chunk.content,
          similarityScore: parseFloat(chunk.similarityScore.toFixed(4)),
          documentId: chunk.documentId,
          fileName: chunk.metadata?.fileName || 'Unknown'
        })),
        historyId: historyEntry._id
      }
    });
  } catch (error) {
    console.error('Ask error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Failed to process question.' });
  }
};

module.exports = { askQuestion };
