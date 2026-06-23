function trimTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function parseOrigins(envValue) {
  return (envValue || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getShortLinkBaseUrl(req) {
  return (
    process.env.SHORT_LINK_BASE_URL ||
    process.env.BASE_URL ||
    `${req.protocol}://${req.get('host')}`
  );
}

function getShortLinkPath() {
  const path = process.env.SHORT_LINK_PATH || '';
  if (!path) {
    return '';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function buildShortUrl(baseUrl, shortCode) {
  const base = trimTrailingSlash(baseUrl);
  const path = getShortLinkPath();
  return path ? `${base}${path}/${shortCode}` : `${base}/${shortCode}`;
}

function getHoldingPageUrl(shortCode) {
  const base = process.env.HOLDING_PAGE_BASE_URL;
  if (!base) {
    return null;
  }

  const path = process.env.HOLDING_PAGE_PATH || '/r';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimTrailingSlash(base)}${normalizedPath}/${shortCode}`;
}

function getAllowedHoldingOrigins() {
  return parseOrigins(process.env.ALLOWED_HOLDING_ORIGINS);
}

function getAllowedDashboardOrigins() {
  return parseOrigins(process.env.ALLOWED_DASHBOARD_ORIGINS);
}

function getShortenerApiBaseUrl(req) {
  return (
    process.env.SHORTENER_API_URL ||
    process.env.SHORT_LINK_BASE_URL ||
    process.env.BASE_URL ||
    `${req.protocol}://${req.get('host')}`
  );
}

module.exports = {
  buildShortUrl,
  getAllowedDashboardOrigins,
  getAllowedHoldingOrigins,
  getHoldingPageUrl,
  getShortLinkBaseUrl,
  getShortLinkPath,
  getShortenerApiBaseUrl,
};
