const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getDbMode } = require('./config/db');
const {
  buildShortUrl,
  getAllowedDashboardOrigins,
  getAllowedHoldingOrigins,
  getHoldingPageUrl,
  getShortLinkBaseUrl,
} = require('./config/env');
const Url = require('./models/Url');

dotenv.config();

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
  })(req, res, next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

  urlDoc.clicks = (urlDoc.clicks || 0) + 1;
  await urlDoc.save();

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

app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    const baseUrl = getShortLinkBaseUrl(req);

    const formattedUrls = urls.map((item) => ({
      _id: item._id,
      originalUrl: item.originalUrl,
      shortCode: item.shortCode,
      shortUrl: buildShortUrl(baseUrl, item.shortCode),
      clicks: item.clicks,
      createdAt: item.createdAt,
    }));

    res.json(formattedUrls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
});

app.post('/api/shorten', async (req, res) => {
  const { url, customAlias, redirectType, shortCodeLength } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    new URL(targetUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    let shortCode;
    const parsedRedirectType = redirectType ? parseInt(redirectType, 10) : 302;
    const parsedLength = shortCodeLength ? parseInt(shortCodeLength, 10) : 6;

    if (customAlias) {
      const alias = customAlias.trim();
      const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
      if (!aliasRegex.test(alias)) {
        return res.status(400).json({
          error: 'Custom alias must be between 3 and 30 characters and only contain letters, numbers, hyphens, and underscores.',
        });
      }

      const existing = await Url.findOne({ shortCode: alias });
      if (existing) {
        return res.status(400).json({ error: 'Custom alias is already taken. Please choose another one.' });
      }

      shortCode = alias;
    } else {
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        shortCode = generateShortCode(parsedLength);
        const existing = await Url.findOne({ shortCode });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: 'Failed to generate a unique short code. Please try again.' });
      }
    }

    const newUrl = await Url.create({
      originalUrl: targetUrl,
      shortCode,
      redirectType: parsedRedirectType,
    });

    const baseUrl = getShortLinkBaseUrl(req);

    res.status(201).json({
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: buildShortUrl(baseUrl, newUrl.shortCode),
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
      redirectType: newUrl.redirectType,
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
});

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

app.delete('/api/urls/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Url.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Shortened URL not found' });
    }
    res.json({ message: 'Shortened URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Server error while deleting URL' });
  }
});

app.get('/go/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  try {
    await handleShortCodeRedirect(req, res, req.params.shortCode);
  } catch (error) {
    console.error('Redirection error:', error);
    res.status(500).send('Server redirection error');
  }
});

app.get('/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  try {
    await handleShortCodeRedirect(req, res, req.params.shortCode);
  } catch (error) {
    console.error('Redirection error:', error);
    res.status(500).send('Server redirection error');
  }
});

app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Uncaught Global Exception:', err.stack || err);
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
    console.log(`🚀 Production server running on port ${port} (bound to 0.0.0.0)`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
