const ClickEvent = require('../models/ClickEvent');
const Url = require('../models/Url');
const { getDbMode } = require('../config/db');
const { parseRange, formatDateKey } = require('../utils/dateRange');

function buildDateMatch(userId, range) {
  const { start } = parseRange(range);
  const match = { user: userId };
  if (start) {
    match.clickedAt = { $gte: start };
  }
  return match;
}

async function aggregateClicksByDay(userId, range) {
  const match = buildDateMatch(userId, range);

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    const byDay = new Map();

    events.forEach((event) => {
      const day = formatDateKey(event.clickedAt);
      if (!byDay.has(day)) {
        byDay.set(day, { date: day, clicks: 0, visitors: new Set() });
      }
      const bucket = byDay.get(day);
      bucket.clicks += 1;
      bucket.visitors.add(event.visitorHash);
    });

    return Array.from(byDay.values())
      .map((item) => ({
        date: item.date,
        clicks: item.clicks,
        unique: item.visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
        },
        clicks: { $sum: 1 },
        visitors: { $addToSet: '$visitorHash' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id.date',
        clicks: 1,
        unique: { $size: '$visitors' },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return rows;
}

async function getUniqueVisitors(userId, range) {
  const match = buildDateMatch(userId, range);

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    return new Set(events.map((event) => event.visitorHash)).size;
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    { $group: { _id: '$visitorHash' } },
    { $count: 'uniqueVisitors' },
  ]);

  return rows[0]?.uniqueVisitors || 0;
}

async function getTotalClicks(userId, range) {
  const match = buildDateMatch(userId, range);

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    return events.length;
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    { $count: 'totalClicks' },
  ]);

  return rows[0]?.totalClicks || 0;
}

async function getTopLinks(userId, range, limit = 5) {
  const match = buildDateMatch(userId, range);

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    const byUrl = new Map();

    events.forEach((event) => {
      const key = String(event.url);
      if (!byUrl.has(key)) {
        byUrl.set(key, { urlId: key, clicks: 0, visitors: new Set() });
      }
      const bucket = byUrl.get(key);
      bucket.clicks += 1;
      bucket.visitors.add(event.visitorHash);
    });

    const sorted = Array.from(byUrl.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);

    const urls = await Promise.all(sorted.map((item) => Url.findById(item.urlId)));
    return sorted.map((item, index) => ({
      urlId: item.urlId,
      shortCode: urls[index]?.shortCode || '',
      originalUrl: urls[index]?.originalUrl || '',
      clicks: item.clicks,
      unique: item.visitors.size,
    }));
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$url',
        clicks: { $sum: 1 },
        visitors: { $addToSet: '$visitorHash' },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'urls',
        localField: '_id',
        foreignField: '_id',
        as: 'urlDoc',
      },
    },
    { $unwind: '$urlDoc' },
    {
      $project: {
        urlId: '$_id',
        shortCode: '$urlDoc.shortCode',
        originalUrl: '$urlDoc.originalUrl',
        clicks: 1,
        unique: { $size: '$visitors' },
      },
    },
  ]);

  return rows;
}

async function getTopReferrers(userId, urlId, range, limit = 5) {
  const match = buildDateMatch(userId, range);
  match.url = urlId;

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    const counts = new Map();

    events.forEach((event) => {
      const ref = event.referrer || '(direct)';
      counts.set(ref, (counts.get(ref) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([referrer, clicks]) => ({ referrer, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$referrer', ''] },
            '(direct)',
            '$referrer',
          ],
        },
        clicks: { $sum: 1 },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        referrer: '$_id',
        clicks: 1,
      },
    },
  ]);

  return rows;
}

async function getLinkClicksByDay(userId, urlId, range) {
  const match = buildDateMatch(userId, range);
  match.url = urlId;

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    const byDay = new Map();

    events.forEach((event) => {
      const day = formatDateKey(event.clickedAt);
      if (!byDay.has(day)) {
        byDay.set(day, { date: day, clicks: 0, visitors: new Set() });
      }
      const bucket = byDay.get(day);
      bucket.clicks += 1;
      bucket.visitors.add(event.visitorHash);
    });

    return Array.from(byDay.values())
      .map((item) => ({
        date: item.date,
        clicks: item.clicks,
        unique: item.visitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } },
        },
        clicks: { $sum: 1 },
        visitors: { $addToSet: '$visitorHash' },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id.date',
        clicks: 1,
        unique: { $size: '$visitors' },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return rows;
}

async function getRecentClicks(userId, range, limit = 10) {
  const match = buildDateMatch(userId, range);

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort({ clickedAt: -1 }).limit(limit);
    const urls = await Promise.all(events.map((event) => Url.findById(event.url)));
    return events.map((event, index) => ({
      urlId: event.url,
      shortCode: urls[index]?.shortCode || '',
      originalUrl: urls[index]?.originalUrl || '',
      clickedAt: event.clickedAt,
      referrer: event.referrer || '',
      visitorHash: event.visitorHash,
      ipHash: event.ipHash || '',
      userAgent: event.userAgent || '',
    }));
  }

  const rows = await ClickEvent.aggregate([
    { $match: match },
    { $sort: { clickedAt: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'urls',
        localField: 'url',
        foreignField: '_id',
        as: 'urlDoc',
      },
    },
    { $unwind: { path: '$urlDoc', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        urlId: '$url',
        shortCode: '$urlDoc.shortCode',
        originalUrl: '$urlDoc.originalUrl',
        clickedAt: 1,
        referrer: 1,
        visitorHash: 1,
        ipHash: 1,
        userAgent: 1,
      },
    },
  ]);

  return rows;
}

async function getSummary(userId, range) {
  const [totalClicks, uniqueVisitors, linkCount, clicksByDay, topLinks, recentClicks] = await Promise.all([
    getTotalClicks(userId, range),
    getUniqueVisitors(userId, range),
    Url.countDocuments({ user: userId }),
    aggregateClicksByDay(userId, range),
    getTopLinks(userId, range, 5),
    getRecentClicks(userId, range, 10),
  ]);

  return {
    totalClicks,
    uniqueVisitors,
    linkCount,
    clicksByDay,
    topLinks,
    totalUrls: linkCount,
    clicksByDate: clicksByDay,
    topUrls: topLinks,
    recentClicks,
  };
}

async function getLinkAnalytics(userId, urlId, range) {
  const urlDoc = await Url.findById(urlId);
  if (!urlDoc || String(urlDoc.user) !== String(userId)) {
    return null;
  }

  const match = buildDateMatch(userId, range);
  match.url = urlDoc._id;

  const [clicksByDay, topReferrers] = await Promise.all([
    getLinkClicksByDay(userId, urlDoc._id, range),
    getTopReferrers(userId, urlDoc._id, range, 5),
  ]);

  let totalClicks = 0;
  let uniqueVisitors = 0;

  if (getDbMode() === 'MOCK') {
    const events = await ClickEvent.find(match).sort();
    totalClicks = events.length;
    uniqueVisitors = new Set(events.map((event) => event.visitorHash)).size;
  } else {
    const totals = await ClickEvent.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          visitors: { $addToSet: '$visitorHash' },
        },
      },
      {
        $project: {
          _id: 0,
          totalClicks: 1,
          uniqueVisitors: { $size: '$visitors' },
        },
      },
    ]);
    totalClicks = totals[0]?.totalClicks || 0;
    uniqueVisitors = totals[0]?.uniqueVisitors || 0;
  }

  return {
    urlId: urlDoc._id,
    shortCode: urlDoc.shortCode,
    originalUrl: urlDoc.originalUrl,
    totalClicks,
    uniqueVisitors,
    clicksByDay,
    topReferrers,
  };
}

module.exports = {
  getSummary,
  getLinkAnalytics,
  getRecentClicks,
  aggregateClicksByDay,
  getLinkClicksByDay,
};
