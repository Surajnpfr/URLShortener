const express = require('express');
const User = require('../models/User');
const { requireAuth, formatUserResponse } = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: formatUserResponse(req.user),
  });
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
