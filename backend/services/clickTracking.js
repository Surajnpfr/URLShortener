const ClickEvent = require('../models/ClickEvent');
const { getVisitorHash, getIpHash } = require('../utils/visitorHash');

async function recordClick(urlDoc, req) {
  const referrer = req.get('referer') || req.get('referrer') || '';
  const userAgent = req.get('user-agent') || '';
  const visitorHash = getVisitorHash(req);
  const ipHash = getIpHash(req);

  await ClickEvent.create({
    url: urlDoc._id,
    user: urlDoc.user,
    referrer,
    userAgent,
    visitorHash,
    ipHash,
    clickedAt: new Date(),
  });

  urlDoc.clicks = (urlDoc.clicks || 0) + 1;
  await urlDoc.save();
}

module.exports = {
  recordClick,
};
