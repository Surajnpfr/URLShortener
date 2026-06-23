const { auth } = require('express-openid-connect');

function getDefaultReturnTo() {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${frontend.replace(/\/$/, '')}/dashboard`;
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

  const isHttps = String(baseURL).startsWith('https://');

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
    },
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
    },
    getLoginState(req) {
      const returnTo = req.query.returnTo || getDefaultReturnTo();
      return { returnTo };
    },
    session: {
      cookie: {
        sameSite: isHttps ? 'None' : 'Lax',
        secure: isHttps,
      },
    },
  });
}

module.exports = {
  createAuth0Middleware,
  getDefaultReturnTo,
  getMissingAuth0Config,
};
