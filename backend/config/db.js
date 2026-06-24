const mongoose = require('mongoose');

let isMockMode = false;

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL
    || process.env.MONGODB_URI
    || 'mongodb://localhost:27017/urlshortener'
  );
}

function isDatabaseReady() {
  if (isMockMode) return true;
  return mongoose.connection.readyState === 1;
}

const connectDB = async () => {
  const dbUrl = getDatabaseUrl();

  try {
    console.log(`Connecting to MongoDB (${maskDatabaseUrl(dbUrl)})...`);
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully.');
    isMockMode = false;

    if (process.env.NODE_ENV === 'production') {
      console.log(`Database mode: MONGODB (readyState=${mongoose.connection.readyState})`);
    }
  } catch (error) {
    console.warn('MongoDB connection failed. Falling back to mock in-memory database.');
    console.warn(`Reason: ${error.message}`);
    isMockMode = true;

    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[DB] Production is using MOCK mode. Set DATABASE_URL or MONGODB_URI to a reachable MongoDB instance.',
      );
    }
  }
};

function maskDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '***';
    return parsed.toString();
  } catch {
    return '(invalid URL)';
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected.');
});

mongoose.connection.on('error', (error) => {
  console.error('[DB] MongoDB connection error:', error.message);
});

const getDbMode = () => (isMockMode ? 'MOCK' : 'MONGODB');

module.exports = {
  connectDB,
  getDbMode,
  getDatabaseUrl,
  isDatabaseReady,
};
