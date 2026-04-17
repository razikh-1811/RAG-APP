/**
 * Split text into overlapping chunks
 * @param {string} text - The full document text
 * @param {number} chunkSize - Max characters per chunk
 * @param {number} overlap - Overlap characters between chunks
 * @returns {string[]} - Array of text chunks
 */
const chunkText = (text, chunkSize = 800, overlap = 150) => {
  if (!text || text.trim().length === 0) return [];

  // Clean text: normalize whitespace
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split into paragraphs first
  const paragraphs = cleanedText.split(/\n\n+/).filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const sentences = paragraph.match(/[^.!?]+[.!?]+[\s]*/g) || [paragraph];

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if ((currentChunk + ' ' + trimmedSentence).length <= chunkSize) {
        currentChunk = currentChunk
          ? currentChunk + ' ' + trimmedSentence
          : trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          // Create overlap: take last `overlap` chars of current chunk
          const overlapText = currentChunk.slice(-overlap);
          currentChunk = overlapText + ' ' + trimmedSentence;
        } else {
          // Single sentence exceeds chunkSize — force split
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length <= chunkSize) {
              wordChunk = wordChunk ? wordChunk + ' ' + word : word;
            } else {
              if (wordChunk) chunks.push(wordChunk.trim());
              wordChunk = word;
            }
          }
          currentChunk = wordChunk;
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Filter out very short chunks (< 50 chars)
  return chunks.filter(chunk => chunk.length >= 50);
};

module.exports = { chunkText };
