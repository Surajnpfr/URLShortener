const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAuth, formatUserResponse } = require('../middleware/auth');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: 'Enter a valid email address' };
  }

  if (!password || String(password).length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }

  return { email: normalizedEmail };
}

function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.userId = user._id.toString();
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

router.post('/register', async (req, res) => {
  const validation = validateCredentials(req.body?.email, req.body?.password);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const name = String(req.body?.name || '').trim();

  try {
    const existing = await User.findOne({ email: validation.email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(String(req.body.password), 12);
    const user = await User.create({
      email: validation.email,
      passwordHash,
      name,
      plan: 'Free',
    });

    await startSession(req, user);

    return res.status(201).json({
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  const validation = validateCredentials(req.body?.email, req.body?.password);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const user = await User.findOne({ email: validation.email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(String(req.body.password), user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    await startSession(req, user);

    return res.json({
      user: formatUserResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.post('/logout', (req, res) => {
  if (!req.session) {
    return res.json({ ok: true });
  }

  return req.session.destroy((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to log out' });
    }

    res.clearCookie('linkly.sid');
    return res.json({ ok: true });
  });
});

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
