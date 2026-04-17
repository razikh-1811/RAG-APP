const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// text-embedding-004 is the most stable and modern ID for 2026
const MODEL_NAME = "gemini-embedding-001";

const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('❌ Embedding Error:', error.message);
    throw new Error(`Embedding failed: ${error.message}`);
  }
};

const generateBatchEmbeddings = async (texts) => {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // 1. Lower batch size to stay under token limits per request
    const BATCH_SIZE = 30; 
    let allEmbeddings = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const currentBatch = texts.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

      const result = await model.batchEmbedContents({
        requests: currentBatch.map((t) => ({
          model: `models/${MODEL_NAME}`, 
          content: { role: "user", parts: [{ text: t }] }
        })),
      });

      const values = result.embeddings.map(e => e.values);
      allEmbeddings = allEmbeddings.concat(values);

      // 2. ⏳ CRITICAL: Add a delay to avoid the 429 error
      // This waits 2 seconds between every batch of 30
      if (i + BATCH_SIZE < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return allEmbeddings;
  } catch (error) {
    console.error('❌ Batch Error:', error.message);
    
    if (error.message.includes('429')) {
      throw new Error("Rate limit exceeded. The file is too large for the Free Tier. Please wait 60 seconds or try a smaller file.");
    }
    
    throw error;
  }
};

module.exports = { generateEmbedding, generateBatchEmbeddings };