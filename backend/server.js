import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbMode } from './config/db.js';
import Url from './models/Url.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// URL shortcode generation helper
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// API: Get database mode (for showing on frontend)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    dbMode: getDbMode(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
  });
});

app.get("/favicon.ico", (req, res) => {
  res.status(200).type("image/svg+xml").send(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#eab308">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
    </svg>
  `);
});

// API: Get all URLs
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Map response to include the full short URL
    const formattedUrls = urls.map(item => ({
      _id: item._id,
      originalUrl: item.originalUrl,
      shortCode: item.shortCode,
      shortUrl: `${baseUrl}/${item.shortCode}`,
      clicks: item.clicks,
      createdAt: item.createdAt,
    }));
    
    res.json(formattedUrls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Server error fetching URLs' });
  }
});

// API: Shorten URL
app.post('/api/shorten', async (req, res) => {
  const { url, customAlias, redirectType, shortCodeLength } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  // Prepend protocol if missing
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }

  // Validate URL format
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
      
      // Validate alias format (alphanumeric, hyphens, underscores, between 3 and 30 characters)
      const aliasRegex = /^[a-zA-Z0-9-_]{3,30}$/;
      if (!aliasRegex.test(alias)) {
        return res.status(400).json({ 
          error: 'Custom alias must be between 3 and 30 characters and only contain letters, numbers, hyphens, and underscores.' 
        });
      }

      // Check if alias already exists
      const existing = await Url.findOne({ shortCode: alias });
      if (existing) {
        return res.status(400).json({ error: 'Custom alias is already taken. Please choose another one.' });
      }
      
      shortCode = alias;
    } else {
      // Generate unique short code
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

    // Save to database
    const newUrl = await Url.create({
      originalUrl: targetUrl,
      shortCode,
      redirectType: parsedRedirectType,
    });

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    res.status(201).json({
      _id: newUrl._id,
      originalUrl: newUrl.originalUrl,
      shortCode: newUrl.shortCode,
      shortUrl: `${baseUrl}/${newUrl.shortCode}`,
      clicks: newUrl.clicks,
      createdAt: newUrl.createdAt,
      redirectType: newUrl.redirectType,
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
});

// API: Delete shortened URL
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

// Redirect endpoint
app.get('/:shortCode([a-zA-Z0-9-_]{3,30})', async (req, res) => {
  const { shortCode } = req.params;
  try {
    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      return res.status(404).send(`
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
      `);
    }

    // Increment click count and save
    urlDoc.clicks = (urlDoc.clicks || 0) + 1;
    await urlDoc.save();

    // Redirect to original URL using the saved redirect status code
    res.redirect(urlDoc.redirectType || 302, urlDoc.originalUrl);
  } catch (error) {
    console.error('Redirection error:', error);
    res.status(500).send('Server redirection error');
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
