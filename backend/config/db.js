const mongoose = require('mongoose');

let isMockMode = false;

const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/urlshortener';

  try {
    console.log(`Connecting to MongoDB at ${dbUrl}...`);
    await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✨ MongoDB connected successfully!');
    isMockMode = false;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Falling back to Mock In-Memory Database.');
    console.warn(`Reason: ${error.message}`);
    isMockMode = true;
  }
};

const getDbMode = () => {
  return isMockMode ? 'MOCK' : 'MONGODB';
};

module.exports = {
  connectDB,
  getDbMode,
};
