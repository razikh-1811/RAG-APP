const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  documentId: {
    type: String,
    required: true
  },
  metadata: {
    fileName: String,
    fileType: String,
    chunkIndex: Number,
    totalChunks: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index on documentId for faster queries
chunkSchema.index({ documentId: 1 });
chunkSchema.index({ 'metadata.uploadedBy': 1 });

module.exports = mongoose.model('Chunk', chunkSchema);
