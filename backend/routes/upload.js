const express = require('express');
const router = express.Router();
const { uploadFile, getDocuments, deleteDocument } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, uploadFile);
router.get('/documents', protect, getDocuments);
router.delete('/documents/:documentId', protect, deleteDocument);

module.exports = router;
