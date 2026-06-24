const crypto = require('crypto');

function getClientIp(req) {
  return req.ip || req.socket?.remoteAddress || '';
}

function getIpHash(req) {
  const ip = getClientIp(req);
  return crypto.createHash('sha256').update(ip).digest('hex');
}

function getVisitorHash(req) {
  const ip = getClientIp(req);
  const userAgent = req.get('user-agent') || '';
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

module.exports = {
  getClientIp,
  getIpHash,
  getVisitorHash,
};
