const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  retrievedChunks: [{
    content: String,
    similarityScore: Number,
    documentId: String,
    fileName: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

historySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('History', historySchema);
