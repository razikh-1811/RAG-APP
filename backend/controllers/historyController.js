const History = require('../models/History');

/**
 * GET /api/history
 * Get all history for the current user
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      History.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      History.countDocuments({ userId: req.user._id })
    ]);

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/history/:id
 * Get a single history entry
 */
const getHistoryById = async (req, res) => {
  try {
    const entry = await History.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/history/:id
 * Delete a single history entry
 */
const deleteHistoryEntry = async (req, res) => {
  try {
    const entry = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'History entry not found.' });
    }

    res.json({ success: true, message: 'History entry deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/history
 * Clear all history for the current user
 */
const clearHistory = async (req, res) => {
  try {
    const result = await History.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `Cleared ${result.deletedCount} history entries.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getHistory, getHistoryById, deleteHistoryEntry, clearHistory };
