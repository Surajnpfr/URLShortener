const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');

const ApiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: 'Default',
    trim: true,
  },
  keyPrefix: {
    type: String,
    required: true,
  },
  keyHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  revokedAt: {
    type: Date,
    default: null,
    index: true,
  },
});

ApiKeySchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { revokedAt: null } },
);

const MongooseApiKeyModel = mongoose.model('ApiKey', ApiKeySchema);

const mockApiKeys = [];

function isActive(record) {
  return record && !record.revokedAt;
}

class MockApiKeyDocument {
  constructor(data) {
    this._id = data._id || `apikey_${Math.random().toString(36).substring(2, 11)}`;
    this.user = data.user;
    this.name = data.name || 'Default';
    this.keyPrefix = data.keyPrefix;
    this.keyHash = data.keyHash;
    this.createdAt = data.createdAt || new Date();
    this.lastUsedAt = data.lastUsedAt || null;
    this.revokedAt = data.revokedAt || null;
  }
}

const MockApiKeyModel = {
  create: async (data) => {
    const doc = new MockApiKeyDocument(data);
    mockApiKeys.push(doc);
    return doc;
  },

  findActiveByUser: async (userId) => {
    const found = mockApiKeys.find((item) => isActive(item) && String(item.user) === String(userId));
    return found ? new MockApiKeyDocument(found) : null;
  },

  findActiveByHash: async (keyHash) => {
    const found = mockApiKeys.find((item) => isActive(item) && item.keyHash === keyHash);
    return found ? new MockApiKeyDocument(found) : null;
  },

  revokeAllForUser: async (userId) => {
    const now = new Date();
    mockApiKeys.forEach((item) => {
      if (String(item.user) === String(userId) && isActive(item)) {
        item.revokedAt = now;
      }
    });
    return { modifiedCount: 1 };
  },

  touchLastUsed: async (id) => {
    const found = mockApiKeys.find((item) => item._id === id);
    if (found) {
      found.lastUsedAt = new Date();
    }
  },
};

async function findActiveByUserMongoose(userId) {
  return MongooseApiKeyModel.findOne({ user: userId, revokedAt: null });
}

async function findActiveByHashMongoose(keyHash) {
  return MongooseApiKeyModel.findOne({ keyHash, revokedAt: null });
}

async function revokeAllForUserMongoose(userId) {
  return MongooseApiKeyModel.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

async function touchLastUsedMongoose(id) {
  return MongooseApiKeyModel.updateOne(
    { _id: id },
    { $set: { lastUsedAt: new Date() } },
  );
}

const ApiKey = {
  create: (data) => (
    getDbMode() === 'MOCK'
      ? MockApiKeyModel.create(data)
      : MongooseApiKeyModel.create(data)
  ),
  findActiveByUser: (userId) => (
    getDbMode() === 'MOCK'
      ? MockApiKeyModel.findActiveByUser(userId)
      : findActiveByUserMongoose(userId)
  ),
  findActiveByHash: (keyHash) => (
    getDbMode() === 'MOCK'
      ? MockApiKeyModel.findActiveByHash(keyHash)
      : findActiveByHashMongoose(keyHash)
  ),
  revokeAllForUser: (userId) => (
    getDbMode() === 'MOCK'
      ? MockApiKeyModel.revokeAllForUser(userId)
      : revokeAllForUserMongoose(userId)
  ),
  touchLastUsed: (id) => (
    getDbMode() === 'MOCK'
      ? MockApiKeyModel.touchLastUsed(id)
      : touchLastUsedMongoose(id)
  ),
};

module.exports = ApiKey;
