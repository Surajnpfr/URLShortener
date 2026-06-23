function parseRange(range) {
  const normalized = String(range || '7d').toLowerCase();
  const now = new Date();

  if (normalized === 'all') {
    return { start: null, end: now };
  }

  const daysMap = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  const days = daysMap[normalized] || 7;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  start.setUTCHours(0, 0, 0, 0);

  return { start, end: now };
}

function formatDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

module.exports = {
  parseRange,
  formatDateKey,
};
