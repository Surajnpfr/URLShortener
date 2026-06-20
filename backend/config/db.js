import mongoose from 'mongoose';

let isMockMode = false;

export const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/urlshortener';
  
  try {
    console.log(`Connecting to MongoDB at ${dbUrl}...`);
    // Connect with a short timeout so fallback triggers quickly if MongoDB is not running
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

export const getDbMode = () => {
  return isMockMode ? 'MOCK' : 'MONGODB';
};
