const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  passwordHash: {
    type: String,
    required: true,
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
    this.email = normalizeEmail(data.email);
    this.passwordHash = data.passwordHash;
    this.name = data.name || '';
    this.plan = data.plan || 'Free';
    this.createdAt = data.createdAt || new Date();
  }
}

const MockUserModel = {
  findOne: async (query) => {
    const found = mockUsers.find((item) => {
      if (query.email && normalizeEmail(item.email) === normalizeEmail(query.email)) return true;
      if (query._id && item._id === query._id) return true;
      return false;
    });
    return found ? new MockUserDocument(found) : null;
  },

  create: async (data) => {
    const doc = new MockUserDocument(data);
    mockUsers.push(doc);
    return doc;
  },

  findOneAndUpdate: async (query, update, options = {}) => {
    const idx = mockUsers.findIndex((item) => {
      if (query._id && item._id === query._id) return true;
      return false;
    });

    const setFields = update.$set || update;

    if (idx === -1) {
      if (!options.upsert) return null;
      const doc = new MockUserDocument({
        _id: query._id,
        email: setFields.email,
        passwordHash: setFields.passwordHash,
        name: setFields.name || '',
        plan: setFields.plan || 'Free',
        createdAt: setFields.createdAt || new Date(),
      });
      mockUsers.push(doc);
      return doc;
    }

    const existing = mockUsers[idx];
    if (setFields.email !== undefined) existing.email = normalizeEmail(setFields.email);
    if (setFields.name !== undefined) existing.name = setFields.name;
    if (setFields.plan !== undefined) existing.plan = setFields.plan;
    if (setFields.passwordHash !== undefined) existing.passwordHash = setFields.passwordHash;
    return new MockUserDocument(existing);
  },

  findById: async (id) => {
    const found = mockUsers.find((item) => item._id === id);
    return found ? new MockUserDocument(found) : null;
  },
};

const User = {
  findOne: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.findOne(...args)
      : MongooseUserModel.findOne(...args)
  ),
  create: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUserModel.create(...args)
      : MongooseUserModel.create(...args)
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
