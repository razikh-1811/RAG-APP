const { v4: uuidv4 } = require('crypto');
const { extractText } = require('../services/extractionService');
const { chunkText } = require('../services/chunkService');
const { generateBatchEmbeddings } = require('../services/embeddingService');
const Chunk = require('../models/Chunk');

/**
 * POST /api/upload
 * Handles file upload, extraction, chunking, and embedding
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const file = req.files.document;
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    const allowedExtensions = ['pdf', 'docx', 'doc', 'txt', 'md'];
    const fileExt = file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported file type. Allowed: PDF, DOCX, TXT`
      });
    }

    console.log(`📄 Processing file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    // Step 1: Extract text
    const extractedText = await extractText(file.data, file.name);
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the file. The file may be empty or corrupted.' });
    }

    console.log(`✅ Text extracted: ${extractedText.length} characters`);

    // Step 2: Chunk text
    const chunks = chunkText(extractedText);
    if (chunks.length === 0) {
      return res.status(400).json({ success: false, message: 'No meaningful content found in the file.' });
    }

    console.log(`✅ Text chunked: ${chunks.length} chunks`);

    // Step 3: Generate embeddings
    const embeddings = await generateBatchEmbeddings(chunks);
    console.log(`✅ Embeddings generated: ${embeddings.length}`);

    // Step 4: Save chunks to MongoDB
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const chunkDocs = chunks.map((content, index) => ({
      content,
      embedding: embeddings[index],
      documentId,
      metadata: {
        fileName: file.name,
        fileType: fileExt,
        chunkIndex: index,
        totalChunks: chunks.length,
        uploadedBy: req.user._id,
        uploadedAt: new Date()
      }
    }));

    await Chunk.insertMany(chunkDocs);
    console.log(`✅ Saved ${chunkDocs.length} chunks to MongoDB`);

    res.json({
      success: true,
      message: `File processed successfully!`,
      data: {
        documentId,
        fileName: file.name,
        totalChunks: chunks.length,
        characters: extractedText.length
      }
    });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ success: false, message: error.message || 'File processing failed.' });
  }
};

/**
 * GET /api/upload/documents
 * Get list of uploaded documents for the current user
 */
const getDocuments = async (req, res) => {
  try {
    const docs = await Chunk.aggregate([
      { $match: { 'metadata.uploadedBy': req.user._id } },
      {
        $group: {
          _id: '$documentId',
          fileName: { $first: '$metadata.fileName' },
          fileType: { $first: '$metadata.fileType' },
          totalChunks: { $first: '$metadata.totalChunks' },
          uploadedAt: { $first: '$metadata.uploadedAt' }
        }
      },
      { $sort: { uploadedAt: -1 } }
    ]);

    res.json({ success: true, documents: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/upload/documents/:documentId
 */
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const result = await Chunk.deleteMany({
      documentId,
      'metadata.uploadedBy': req.user._id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    res.json({ success: true, message: `Document deleted (${result.deletedCount} chunks removed).` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadFile, getDocuments, deleteDocument };
