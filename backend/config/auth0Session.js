const { auth } = require('express-openid-connect');
const { getAllowedDashboardOrigins } = require('./env');

function getDefaultLogoutReturnTo() {
  // Auth0 "returnTo" after logout — must be the React dashboard (FRONTEND_URL),
  // never BASE_URL (https://app.drovashop.com).
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  return frontend.replace(/\/$/, '');
}

function getDefaultReturnTo() {
  return `${getDefaultLogoutReturnTo()}/dashboard`;
}

function getSessionCookieOptions(baseURL) {
  const isHttps = String(baseURL).startsWith('https://');
  const cookie = {
    sameSite: isHttps ? 'None' : 'Lax',
    secure: isHttps,
  };

  if (isHttps) {
    try {
      const hostname = new URL(baseURL).hostname;
      const parts = hostname.split('.');
      if (parts.length >= 2 && !hostname.endsWith('localhost')) {
        cookie.domain = `.${parts.slice(-2).join('.')}`;
      }
    } catch {
      // ignore invalid BASE_URL
    }
  }

  return cookie;
}

function isAllowedReturnTo(returnTo) {
  if (!returnTo || typeof returnTo !== 'string') {
    return false;
  }

  try {
    const target = new URL(returnTo);
    const allowedOrigins = new Set(getAllowedDashboardOrigins());

    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      allowedOrigins.add(new URL(frontendUrl).origin);
    }

    return allowedOrigins.has(target.origin);
  } catch {
    return false;
  }
}

function warnIfLogoutTargetIsApiHost() {
  try {
    const logoutReturn = getDefaultLogoutReturnTo();
    const apiBase = (process.env.BASE_URL || '').replace(/\/$/, '');
    if (!logoutReturn || !apiBase) return;

    if (new URL(logoutReturn).origin === new URL(apiBase).origin) {
      console.warn(
        '[Auth0] FRONTEND_URL must not equal BASE_URL. Logout will redirect to the API host instead of the dashboard.',
      );
    }
  } catch {
    // ignore invalid URLs during startup
  }
}

function getMissingAuth0Config() {
  const missing = [];
  if (!process.env.ISSUER_BASE_URL) missing.push('ISSUER_BASE_URL');
  if (!process.env.CLIENT_ID) missing.push('CLIENT_ID');
  if (!process.env.CLIENT_SECRET) missing.push('CLIENT_SECRET');
  if (!process.env.SECRET) missing.push('SECRET');
  if (!process.env.BASE_URL) missing.push('BASE_URL');
  return missing;
}

function createAuth0Middleware() {
  const issuerBaseURL = process.env.ISSUER_BASE_URL?.replace(/\/$/, '');
  const clientID = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  const secret = process.env.SECRET;
  const baseURL = process.env.BASE_URL;

  const missing = getMissingAuth0Config();
  if (missing.length > 0) {
    console.warn(`Auth0 is not configured. Missing: ${missing.join(', ')}`);
    return null;
  }

  const postLogoutRedirect = getDefaultLogoutReturnTo();
  warnIfLogoutTargetIsApiHost();

  return auth({
    authRequired: false,
    auth0Logout: true,
    secret,
    baseURL,
    clientID,
    clientSecret,
    issuerBaseURL,
    routes: {
      login: false,
      logout: false,
      postLogoutRedirect,
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
    getLoginState(req) {
      const requested = req.query.returnTo;
      const returnTo = requested && isAllowedReturnTo(requested)
        ? requested
        : getDefaultReturnTo();
      return { returnTo };
    },
    session: {
      cookie: getSessionCookieOptions(baseURL),
    },
  });
}

module.exports = {
  createAuth0Middleware,
  getDefaultReturnTo,
  getDefaultLogoutReturnTo,
  getMissingAuth0Config,
  isAllowedReturnTo,
};
