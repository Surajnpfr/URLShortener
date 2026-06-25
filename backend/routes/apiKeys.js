const express = require('express');
const {
  requireSessionAuth,
  formatUserResponse,
} = require('../middleware/auth');
const {
  createApiKeyForUser,
  formatApiKeyMetadata,
  getActiveKeyForUser,
  revokeKeyForUser,
} = require('../services/apiKeyService');

const router = express.Router();

router.get('/', requireSessionAuth, async (req, res) => {
  try {
    const record = await getActiveKeyForUser(req.user._id);
    const apiKey = formatApiKeyMetadata(record);

    return res.json({
      hasKey: Boolean(apiKey),
      apiKey,
    });
  } catch (error) {
    console.error('[api-key] fetch failed:', error.message);
    return res.status(500).json({ error: 'Failed to load API key' });
  }
});

router.post('/', requireSessionAuth, async (req, res) => {
  const name = String(req.body?.name || 'Default').trim() || 'Default';

  try {
    const { plainKey, metadata } = await createApiKeyForUser(req.user._id, name);

    return res.status(201).json({
      key: plainKey,
      apiKey: metadata,
      message: 'Copy this key now. It will not be shown again.',
    });
  } catch (error) {
    console.error('[api-key] create failed:', error.message);
    return res.status(500).json({ error: 'Failed to generate API key' });
  }
});

router.delete('/', requireSessionAuth, async (req, res) => {
  try {
    await revokeKeyForUser(req.user._id);
    return res.json({ success: true, message: 'API key revoked' });
  } catch (error) {
    console.error('[api-key] revoke failed:', error.message);
    return res.status(500).json({ error: 'Failed to revoke API key' });
  }
});

module.exports = router;
