const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB, getDbMode } = require('./config/db');
const { createAuth0Middleware, getMissingAuth0Config, isAllowedReturnTo, getDefaultLogoutReturnTo } = require('./config/auth0Session');
const {
  buildShortUrl,
  getAllowedDashboardOrigins,
  getAllowedHoldingOrigins,
  getHoldingPageUrl,
  getShortLinkBaseUrl,
} = require('./config/env');
const Url = require('./models/Url');
const { recordClick } = require('./services/clickTracking');
const authRoutes = require('./routes/auth');
const urlsRoutes = require('./routes/urls');
const analyticsRoutes = require('./routes/analytics');
const { requireAuth } = require('./middleware/auth');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.set('trust proxy', 1);

const dashboardOrigins = getAllowedDashboardOrigins();
const holdingOrigins = getAllowedHoldingOrigins();

app.use((req, res, next) => {
  const isResolveRoute = req.path.startsWith('/api/resolve');
  const allowedOrigins = isResolveRoute ? holdingOrigins : dashboardOrigins;

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })(req, res, next);
});

const auth0Middleware = createAuth0Middleware();
if (auth0Middleware) {
  app.use(auth0Middleware);

  app.get('/signup', (req, res) => {
    res.oidc.login({
      returnTo: req.query.returnTo || undefined,
      authorizationParams: { screen_hint: 'signup' },
    });
  });

  app.get('/login', (req, res) => {
    if (req.oidc.isAuthenticated()) {
      const returnTo = req.query.returnTo;
      if (returnTo && isAllowedReturnTo(returnTo)) {
        return res.redirect(returnTo);
      }
      return res.redirect(process.env.FRONTEND_URL || '/');
    }

    res.oidc.login({
      returnTo: req.query.returnTo || undefined,
    });
  });

  app.get('/logout', (req, res) => {
    // Always send users to the dashboard after Auth0 logout — never BASE_URL (API host).
    const returnTo = getDefaultLogoutReturnTo();
    return res.oidc.logout({ returnTo });
  });
} else {
  const authNotConfiguredHandler = (req, res) => {
    const missing = getMissingAuth0Config();
    res.status(503).json({
      error: 'Auth0 is not configured on the server',
      missing,
      message: missing.length > 0
        ? `Add these to backend/.env and restart the API: ${missing.join(', ')}`
        : 'Set Auth0 variables in backend/.env, then restart the API.',
    });
  };

  app.get('/login', authNotConfiguredHandler);
  app.get('/signup', authNotConfiguredHandler);
  app.get('/callback', authNotConfiguredHandler);
  app.get('/logout', authNotConfiguredHandler);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function renderNotFoundPage(baseUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Link Not Found</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0b0f19; color: #f3f4f6; text-align: center; padding: 50px 20px; }
        .card { max-width: 500px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 40px; border-radius: 16px; backdrop-filter: blur(10px); }
        h1 { color: #f87171; margin-top: 0; }
        p { color: #9ca3af; font-size: 1.1rem; line-height: 1.6; }
        a { display: inline-block; margin-top: 20px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; transition: opacity 0.2s; }
        a:hover { opacity: 0.9; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>404 - Link Not Found</h1>
        <p>The shortened link you are trying to access does not exist or has expired.</p>
        <a href="${baseUrl}">Go to URL Shortener</a>
      </div>
    </body>
    </html>
  `;
}

async function handleShortCodeRedirect(req, res, shortCode) {
  const urlDoc = await Url.findOne({ shortCode });
  if (!urlDoc) {
    const baseUrl = getShortLinkBaseUrl(req);
    return res.status(404).send(renderNotFoundPage(baseUrl));
  }

  await recordClick(urlDoc, req);

  const holdingUrl = getHoldingPageUrl(shortCode);
  if (holdingUrl) {
    return res.redirect(302, holdingUrl);
  }

  res.redirect(urlDoc.redirectType || 302, urlDoc.originalUrl);
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'URL Shortener API Server is running',
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(200).type('image/svg+xml').send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#eab308">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  `);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    dbMode: getDbMode(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlsRoutes);
app.post('/api/shorten', requireAuth, urlsRoutes.handleShorten);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/resolve/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      return res.status(404).json({ error: 'Shortened URL not found' });
    }

    res.json({
      originalUrl: urlDoc.originalUrl,
      redirectType: urlDoc.redirectType || 302,
    });
  } catch (error) {
    console.error('Error resolving URL:', error);
    res.status(500).json({ error: 'Server error resolving URL' });
  }
});

const RESERVED_SHORT_CODES = new Set([
  'login', 'logout', 'signup', 'register', 'callback', 'health', 'favicon', 'api',
]);

async function handleRootShortCodeRedirect(req, res, shortCode) {
  if (RESERVED_SHORT_CODES.has(shortCode)) {
    return res.status(404).json({
      status: 404,
      error: 'Not Found',
      message: `Cannot GET /${shortCode}`,
    });
  }

  try {
    await handleShortCodeRedirect(req, res, shortCode);
  } catch (error) {
    console.error('Redirection error:', error);
    res.status(500).send('Server redirection error');
  }
}

app.get('/go/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  await handleRootShortCodeRedirect(req, res, req.params.shortCode);
});

app.get('/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  await handleRootShortCodeRedirect(req, res, req.params.shortCode);
});

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('Uncaught Global Exception:', err.stack || err);
  res.status(500).json({
    status: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

async function startServer() {
  await connectDB();

  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Production server running on port ${port} (bound to 0.0.0.0)`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
