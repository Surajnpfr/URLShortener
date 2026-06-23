const ClickEvent = require('../models/ClickEvent');
const { getVisitorHash } = require('../utils/visitorHash');

async function recordClick(urlDoc, req) {
  const referrer = req.get('referer') || req.get('referrer') || '';
  const userAgent = req.get('user-agent') || '';
  const visitorHash = getVisitorHash(req);

  await ClickEvent.create({
    url: urlDoc._id,
    user: urlDoc.user,
    referrer,
    userAgent,
    visitorHash,
    clickedAt: new Date(),
  });

  urlDoc.clicks = (urlDoc.clicks || 0) + 1;
  await urlDoc.save();
}

module.exports = {
  recordClick,
};
