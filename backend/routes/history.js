const express = require('express');
const router = express.Router();
const { getHistory, getHistoryById, deleteHistoryEntry, clearHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getHistory);
router.get('/:id', protect, getHistoryById);
router.delete('/', protect, clearHistory);
router.delete('/:id', protect, deleteHistoryEntry);

module.exports = router;
