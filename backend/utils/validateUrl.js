const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function validateAndNormalizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'Original URL is required' };
  }

  let targetUrl = rawUrl.trim();
  if (!targetUrl) {
    return { ok: false, error: 'Original URL is required' };
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { ok: false, error: 'Invalid URL format' };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { ok: false, error: 'URL must use http or https' };
  }

  if (!parsed.hostname) {
    return { ok: false, error: 'Invalid URL format' };
  }

  return { ok: true, url: parsed.toString() };
}

module.exports = {
  validateAndNormalizeUrl,
};
