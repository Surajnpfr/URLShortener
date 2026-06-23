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

const MongooseUrlModel = mongoose.model('Url', UrlSchema);

const mockDb = [];

class MockUrlDocument {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.originalUrl = data.originalUrl;
    this.shortCode = data.shortCode;
    this.clicks = data.clicks || 0;
    this.createdAt = data.createdAt || new Date();
    this.redirectType = data.redirectType || 302;
  }

  async save() {
    const idx = mockDb.findIndex((item) => item._id === this._id);
    if (idx !== -1) {
      mockDb[idx] = this;
    } else {
      mockDb.push(this);
    }
    return this;
  }
}

const MockUrlModel = {
  find: () => ({
    sort: () => {
      const sorted = [...mockDb]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((item) => new MockUrlDocument(item));
      return Promise.resolve(sorted);
    },
    then: (resolve) => {
      const mapped = mockDb.map((item) => new MockUrlDocument(item));
      return Promise.resolve(mapped).then(resolve);
    },
  }),

  findOne: async (query) => {
    const found = mockDb.find((item) => {
      if (query.shortCode && item.shortCode === query.shortCode) return true;
      if (query._id && item._id === query._id) return true;
      return false;
    });
    return found ? new MockUrlDocument(found) : null;
  },

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
};

const Url = {
  find: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.find()
      : MongooseUrlModel.find(...args)
  ),
  findOne: (...args) => (
    getDbMode() === 'MOCK'
      ? MockUrlModel.findOne(...args)
      : MongooseUrlModel.findOne(...args)
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
};

module.exports = Url;
