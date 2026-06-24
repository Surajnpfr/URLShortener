const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');

const ClickEventSchema = new mongoose.Schema({
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  clickedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  referrer: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  visitorHash: {
    type: String,
    required: true,
    index: true,
  },
  ipHash: {
    type: String,
    default: '',
    index: true,
  },
});

ClickEventSchema.index({ user: 1, clickedAt: -1 });
ClickEventSchema.index({ url: 1, clickedAt: -1 });

const MongooseClickEventModel = mongoose.model('ClickEvent', ClickEventSchema);

const mockClicks = [];

class MockClickEventDocument {
  constructor(data) {
    this._id = data._id || `click_${Math.random().toString(36).substring(2, 9)}`;
    this.url = data.url;
    this.user = data.user;
    this.clickedAt = data.clickedAt || new Date();
    this.referrer = data.referrer || '';
    this.userAgent = data.userAgent || '';
    this.visitorHash = data.visitorHash;
    this.ipHash = data.ipHash || '';
  }
}

function matchesMockQuery(row, query = {}) {
  return Object.entries(query).every(([key, value]) => {
    if (value && typeof value === 'object' && value.$gte !== undefined) {
      return new Date(row[key]) >= new Date(value.$gte);
    }
    if (value && typeof value === 'object' && value.$in) {
      return value.$in.some((v) => String(v) === String(row[key]));
    }
    return String(row[key]) === String(value);
  });
}

function buildMockFindQuery(query = {}) {
  let rows = mockClicks
    .filter((item) => matchesMockQuery(item, query))
    .map((item) => new MockClickEventDocument(item));

  const chain = {
    sort(sortSpec) {
      if (sortSpec && typeof sortSpec === 'object') {
        const [[field, dir]] = Object.entries(sortSpec);
        rows.sort((a, b) => {
          const av = a[field];
          const bv = b[field];
          if (av < bv) return dir === 1 ? -1 : 1;
          if (av > bv) return dir === 1 ? 1 : -1;
          return 0;
        });
      }
      return chain;
    },
    limit(n) {
      rows = rows.slice(0, n);
      return chain;
    },
    then(resolve, reject) {
      return Promise.resolve(rows).then(resolve, reject);
    },
  };

  return chain;
}

const MockClickEventModel = {
  create: async (data) => {
    const doc = new MockClickEventDocument(data);
    mockClicks.push(doc);
    return doc;
  },

  aggregate: async (pipeline) => {
    let rows = mockClicks.map((item) => ({ ...item }));

    for (const stage of pipeline) {
      if (stage.$match) {
        rows = rows.filter((row) => matchesMockQuery(row, stage.$match));
      }

      if (stage.$group) {
        const grouped = new Map();
        const idField = stage.$group._id;

        rows.forEach((row) => {
          let groupKey;
          if (idField === null) {
            groupKey = '__all__';
          } else if (typeof idField === 'string' && idField.startsWith('$')) {
            groupKey = row[idField.slice(1)];
          } else if (idField && idField.date) {
            const d = new Date(row.clickedAt);
            groupKey = d.toISOString().slice(0, 10);
          } else if (idField && idField.visitorHash) {
            groupKey = row.visitorHash;
          } else {
            groupKey = JSON.stringify(idField);
          }

          if (!grouped.has(groupKey)) {
            grouped.set(groupKey, { _id: groupKey === '__all__' ? null : groupKey, count: 0, visitors: new Set() });
          }
          const bucket = grouped.get(groupKey);
          bucket.count += 1;
          if (row.visitorHash) bucket.visitors.add(row.visitorHash);
        });

        rows = Array.from(grouped.values()).map((bucket) => ({
          _id: bucket._id,
          count: bucket.count,
          unique: bucket.visitors.size,
        }));
      }

      if (stage.$sort) {
        const [[field, dir]] = Object.entries(stage.$sort);
        rows.sort((a, b) => {
          const av = a._id?.[field] ?? a._id ?? a[field];
          const bv = b._id?.[field] ?? b._id ?? b[field];
          if (av < bv) return dir === 1 ? -1 : 1;
          if (av > bv) return dir === 1 ? 1 : -1;
          return 0;
        });
      }

      if (stage.$limit) {
        rows = rows.slice(0, stage.$limit);
      }
    }

    return rows;
  },

  find: (query = {}) => buildMockFindQuery(query),
};

const ClickEvent = {
  create: (...args) => (
    getDbMode() === 'MOCK'
      ? MockClickEventModel.create(...args)
      : MongooseClickEventModel.create(...args)
  ),
  aggregate: (...args) => (
    getDbMode() === 'MOCK'
      ? MockClickEventModel.aggregate(...args)
      : MongooseClickEventModel.aggregate(...args)
  ),
  find: (...args) => (
    getDbMode() === 'MOCK'
      ? MockClickEventModel.find(...args)
      : MongooseClickEventModel.find(...args)
  ),
};

module.exports = ClickEvent;
