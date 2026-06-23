const session = require('express-session');

function getSessionSecret() {
  return process.env.SECRET || '';
}

function getCookieSettings() {
  const baseURL = process.env.BASE_URL || '';
  const isHttps = String(baseURL).startsWith('https://');
  return {
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
  };
}

function createSessionMiddleware() {
  const secret = getSessionSecret();

  if (!secret || secret.length < 32) {
    console.warn('Session auth is not configured. Set SECRET (32+ chars) in backend/.env');
    return null;
  }

  const cookieSettings = getCookieSettings();

  return session({
    name: 'linkly.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      ...cookieSettings,
    },
  });
}

module.exports = {
  createSessionMiddleware,
  getSessionSecret,
};
