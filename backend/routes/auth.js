const express = require('express');
const User = require('../models/User');
const { requireAuth, requireSessionAuth, formatUserResponse } = require('../middleware/auth');

const router = express.Router();

router.get('/session', (req, res) => {
  res.json({
    authenticated: Boolean(req.oidc?.isAuthenticated()),
  });
});

router.get('/me', requireAuth, (req, res) => {
  const payload = {
    user: formatUserResponse(req.user),
    authMethod: req.authMethod || 'session',
  };

  if (req.authMethod === 'api_key') {
    payload.apiKeyPrefix = req.apiKey?.keyPrefix || null;
  }

  return res.json(payload);
});

router.patch('/me', requireSessionAuth, async (req, res) => {
  const nextName = String(req.body?.name || req.body?.fullName || '').trim();

  if (!nextName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { name: nextName } },
      { new: true },
    );

    res.json({
      user: formatUserResponse(updated),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
