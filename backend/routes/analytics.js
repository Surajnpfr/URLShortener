const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getSummary, getLinkAnalytics } = require('../services/analyticsService');

const router = express.Router();

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const range = req.query.range || '7d';
    const summary = await getSummary(req.user._id, range);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ error: 'Server error fetching analytics summary' });
  }
});

router.get('/links/:urlId', requireAuth, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const analytics = await getLinkAnalytics(req.user._id, req.params.urlId, range);

    if (!analytics) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    res.status(500).json({ error: 'Server error fetching link analytics' });
  }
});

module.exports = router;
