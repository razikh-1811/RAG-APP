const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from PDF buffer
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from DOCX buffer
 */
const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from TXT buffer
 */
const extractFromTXT = (buffer) => {
  return buffer.toString('utf-8');
};

/**
 * Extract text from uploaded file based on its type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - File MIME type or extension
 * @returns {Promise<string>} - Extracted text
 */
const extractText = async (buffer, fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();

  switch (extension) {
    case 'pdf':
      return await extractFromPDF(buffer);
    case 'docx':
    case 'doc':
      return await extractFromDOCX(buffer);
    case 'txt':
    case 'md':
      return extractFromTXT(buffer);
    default:
      throw new Error(`Unsupported file type: .${extension}. Supported types: PDF, DOCX, TXT`);
  }
};

module.exports = { extractText };
