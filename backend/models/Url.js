const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');

const UrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  redirectType: {
    type: Number,
    default: 302,
  },
});

UrlSchema.index({ user: 1, createdAt: -1 });

const MongooseUrlModel = mongoose.model('Url', UrlSchema);

const mockDb = [];

function matchesQuery(item, query = {}) {
  return Object.entries(query).every(([key, value]) => {
    if (value && typeof value === 'object' && value.$ne !== undefined) {
      return String(item[key]) !== String(value.$ne);
    }
    return String(item[key]) === String(value);
  });
}

class MockUrlDocument {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.originalUrl = data.originalUrl;
    this.shortCode = data.shortCode;
    this.user = data.user;
    this.clicks = data.clicks || 0;
    this.createdAt = data.createdAt || new Date();
    this.redirectType = data.redirectType || 302;
  }

  async save() {
    const idx = mockDb.findIndex((item) => item._id === this._id);
    if (idx !== -1) {
      mockDb[idx] = { ...this };
    } else {
      mockDb.push({ ...this });
    }
    return this;
  }
}

const MockUrlModel = {
  find: (query = {}) => ({
    sort: (sortSpec) => {
      const filtered = mockDb
        .filter((item) => matchesQuery(item, query))
        .sort((a, b) => {
          if (sortSpec?.createdAt === -1) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        })
        .map((item) => new MockUrlDocument(item));
      return Promise.resolve(filtered);
    },
  }),

  findOne: async (query) => {
    const found = mockDb.find((item) => matchesQuery(item, query));
    return found ? new MockUrlDocument(found) : null;
  },

  findById: async (id) => MockUrlModel.findOne({ _id: id }),

  create: async (data) => {
    const doc = new MockUrlDocument(data);
    await doc.save();
    return doc;
  },

  findByIdAndDelete: async (id) => {
    const idx = mockDb.findIndex((item) => item._id === id);
    if (idx !== -1) {
      const deleted = mockDb[idx];
      mockDb.splice(idx, 1);
      return new MockUrlDocument(deleted);
    }
    return null;
  },

  countDocuments: async (query = {}) => mockDb.filter((item) => matchesQuery(item, query)).length,
};

const Url = {
  find: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.find(...args)
      : MongooseUrlModel.find(...args)
  ),
  findOne: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.findOne(...args)
      : MongooseUrlModel.findOne(...args)
  ),
  findById: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.findById(...args)
      : MongooseUrlModel.findById(...args)
  ),
  create: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.create(...args)
      : MongooseUrlModel.create(...args)
  ),
  findByIdAndDelete: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.findByIdAndDelete(...args)
      : MongooseUrlModel.findByIdAndDelete(...args)
  ),
  countDocuments: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.countDocuments(...args)
      : MongooseUrlModel.countDocuments(...args)
  ),
};

module.exports = Url;
