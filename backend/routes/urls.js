const express = require('express');
const Url = require('../models/Url');
const { requireAuth } = require('../middleware/auth');
const { buildShortUrl, getShortLinkBaseUrl } = require('../config/env');

const router = express.Router();

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function formatUrlItem(req, item) {
  const baseUrl = getShortLinkBaseUrl(req);
  return {
    _id: item._id,
    originalUrl: item.originalUrl,
    shortCode: item.shortCode,
    shortUrl: buildShortUrl(baseUrl, item.shortCode),
    clicks: item.clicks,
    createdAt: item.createdAt,
    redirectType: item.redirectType,
  };
}

async function handleShorten(req, res) {
  const { url, customAlias, redirectType, shortCodeLength } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    new URL(targetUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    let shortCode;
    const parsedRedirectType = redirectType ? parseInt(redirectType, 10) : 302;
    const parsedLength = shortCodeLength ? parseInt(shortCodeLength, 10) : 6;

    if (customAlias) {
      const alias = customAlias.trim();
      const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
      if (!aliasRegex.test(alias)) {
        return res.status(400).json({
          error: 'Custom alias must be between 3 and 30 characters and only contain letters, numbers, hyphens, and underscores.',
        });
      }

      const existing = await Url.findOne({ shortCode: alias });
      if (existing) {
        return res.status(400).json({ error: 'Custom alias is already taken. Please choose another one.' });
      }

      shortCode = alias;
    } else {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        shortCode = generateShortCode(parsedLength);
        const existing = await Url.findOne({ shortCode });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Failed to generate a unique short code. Please try again.' });
      }
    }

    const newUrl = await Url.create({
      originalUrl: targetUrl,
      shortCode,
      redirectType: parsedRedirectType,
      user: req.user._id,
    });

    res.status(201).json(formatUrlItem(req, newUrl));
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(urls.map((item) => formatUrlItem(req, item)));
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await Url.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Shortened URL not found' });
    }

    if (String(existing.user) !== String(req.user._id)) {
      return res.status(403).json({ error: 'You do not have permission to delete this link' });
    }

    await Url.findByIdAndDelete(id);
    res.json({ message: 'Shortened URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Server error while deleting URL' });
  }
});

module.exports = router;
module.exports.handleShorten = handleShorten;
