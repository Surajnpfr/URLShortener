const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');

const UserSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    default: '',
  },
  plan: {
    type: String,
    default: 'Free',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseUserModel = mongoose.model('User', UserSchema);

const mockUsers = [];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

class MockUserDocument {
  constructor(data) {
    this._id = data._id || `user_${Math.random().toString(36).substring(2, 9)}`;
    this.auth0Id = data.auth0Id;
    this.email = normalizeEmail(data.email);
    this.name = data.name || '';
    this.plan = data.plan || 'Free';
    this.createdAt = data.createdAt || new Date();
  }
}

const MockUserModel = {
  findOne: async (query) => {
    const found = mockUsers.find((item) => {
      if (query.auth0Id && item.auth0Id === query.auth0Id) return true;
      if (query._id && item._id === query._id) return true;
      if (query.email && normalizeEmail(item.email) === normalizeEmail(query.email)) return true;
      return false;
    });
    return found ? new MockUserDocument(found) : null;
  },

  findOneByEmail: async (email) => {
    const normalized = normalizeEmail(email);
    if (!normalized) return null;
    return MockUserModel.findOne({ email: normalized });
  },

  findOneAndUpdate: async (query, update, options = {}) => {
    const idx = mockUsers.findIndex((item) => {
      if (query.auth0Id && item.auth0Id === query.auth0Id) return true;
      if (query._id && item._id === query._id) return true;
      return false;
    });

    const setOnInsert = update.$setOnInsert || {};
    const setFields = update.$set || update;

    if (idx === -1) {
      if (!options.upsert) return null;
      const doc = new MockUserDocument({
        auth0Id: query.auth0Id,
        email: setFields.email || setOnInsert.email,
        name: setFields.name || setOnInsert.name || '',
        plan: setOnInsert.plan || 'Free',
        createdAt: setOnInsert.createdAt || new Date(),
      });
      mockUsers.push(doc);
      return doc;
    }

    const existing = mockUsers[idx];
    if (setFields.auth0Id !== undefined) existing.auth0Id = setFields.auth0Id;
    if (setFields.email !== undefined) existing.email = normalizeEmail(setFields.email);
    if (setFields.name !== undefined) existing.name = setFields.name;
    if (setFields.plan !== undefined) existing.plan = setFields.plan;
    return new MockUserDocument(existing);
  },

  findById: async (id) => {
    const found = mockUsers.find((item) => item._id === id);
    return found ? new MockUserDocument(found) : null;
  },
};

async function findOneByEmailMongoose(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  let found = await MongooseUserModel.findOne({ email: normalized });
  if (found) return found;

  return MongooseUserModel.findOne({
    email: {
      $regex: new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    },
  });
}

const User = {
  findOne: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.findOne(...args)
      : MongooseUserModel.findOne(...args)
  ),
  findOneByEmail: (email) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.findOneByEmail(email)
      : findOneByEmailMongoose(email)
  ),
  findOneAndUpdate: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.findOneAndUpdate(...args)
      : MongooseUserModel.findOneAndUpdate(...args)
  ),
  findById: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.findById(...args)
      : MongooseUserModel.findById(...args)
  ),
};

module.exports = User;
