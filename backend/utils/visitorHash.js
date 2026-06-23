const crypto = require('crypto');

function getVisitorHash(req) {
  const ip = req.ip || req.socket?.remoteAddress || '';
  const userAgent = req.get('user-agent') || '';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

module.exports = {
  getVisitorHash,
};
