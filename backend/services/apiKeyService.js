const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const User = require('../models/User');
const { isDatabaseReady } = require('../config/db');

const KEY_PREFIX = 'lk_live_';
const KEY_RANDOM_LENGTH = 32;

function getPepper() {
  const pepper = process.env.API_KEY_PEPPER || process.env.SECRET;
  if (!pepper) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_KEY_PEPPER or SECRET must be set in production');
    }
    return 'dev-api-key-pepper';
  }
  return pepper;
}

function hashKey(plainKey) {
  return crypto.createHmac('sha256', getPepper()).update(plainKey).digest('hex');
}

function verifyKeyHash(plainKey, storedHash) {
  const computed = hashKey(plainKey);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

function generatePlainKey() {
  const randomPart = crypto.randomBytes(24).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, KEY_RANDOM_LENGTH);
  const padded = randomPart.padEnd(KEY_RANDOM_LENGTH, '0');
  return `${KEY_PREFIX}${padded}`;
}

function getDisplayPrefix(plainKey) {
  return plainKey.slice(0, Math.min(16, plainKey.length));
}

function extractBearerToken(req) {
  const header = req.headers?.authorization;
  if (!header || typeof header !== 'string') {
    return null;
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const token = match[1].trim();
  if (!token.startsWith(KEY_PREFIX)) {
    return null;
  }

  return token;
}

function formatApiKeyMetadata(record) {
  if (!record || record.revokedAt) {
    return null;
  }

  return {
    id: record._id,
    name: record.name || 'Default',
    prefix: record.keyPrefix,
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt || null,
  };
}

async function getActiveKeyForUser(userId) {
  return ApiKey.findActiveByUser(userId);
}

async function revokeKeyForUser(userId) {
  return ApiKey.revokeAllForUser(userId);
}

async function createApiKeyForUser(userId, name = 'Default') {
  if (!isDatabaseReady()) {
    throw new Error('Database is not ready');
  }

  await ApiKey.revokeAllForUser(userId);

  const plainKey = generatePlainKey();
  const keyHash = hashKey(plainKey);
  const keyPrefix = getDisplayPrefix(plainKey);

  const record = await ApiKey.create({
    user: userId,
    name: String(name || 'Default').trim() || 'Default',
    keyPrefix,
    keyHash,
    createdAt: new Date(),
  });

  return {
    record,
    plainKey,
    metadata: formatApiKeyMetadata(record),
  };
}

async function authenticateApiKey(plainKey) {
  if (!plainKey || !plainKey.startsWith(KEY_PREFIX)) {
    return null;
  }

  if (!isDatabaseReady()) {
    return null;
  }

  const keyHash = hashKey(plainKey);
  const record = await ApiKey.findActiveByHash(keyHash);
  if (!record) {
    return null;
  }

  if (!verifyKeyHash(plainKey, record.keyHash)) {
    return null;
  }

  const user = await User.findById(record.user);
  if (!user) {
    return null;
  }

  void ApiKey.touchLastUsed(record._id);

  return { user, apiKey: record };
}

module.exports = {
  authenticateApiKey,
  createApiKeyForUser,
  extractBearerToken,
  formatApiKeyMetadata,
  generatePlainKey,
  getActiveKeyForUser,
  getDisplayPrefix,
  hashKey,
  revokeKeyForUser,
  verifyKeyHash,
};
