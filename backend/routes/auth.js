const express = require('express');
const User = require('../models/User');
const { requireAuth, formatUserResponse, syncUserFromOidc } = require('../middleware/auth');

const router = express.Router();

router.get('/session', (req, res) => {
  res.json({
    authenticated: Boolean(req.oidc?.isAuthenticated()),
  });
});

router.get('/me', async (req, res) => {
  if (!req.oidc?.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await syncUserFromOidc(req);
    return res.json({
      user: formatUserResponse(req.user),
    });
  } catch (error) {
    console.error('Failed to sync user (returning Auth0 profile):', error);
    const oidcUser = req.oidc.user || {};
    return res.json({
      user: {
        email: oidcUser.email || '',
        name: oidcUser.name || oidcUser.nickname || '',
        fullName: oidcUser.name || oidcUser.nickname || '',
        plan: 'Free',
      },
      degraded: true,
    });
  }
});

router.patch('/me', requireAuth, async (req, res) => {
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
