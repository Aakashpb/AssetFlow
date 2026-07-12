import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/assetflow_db';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connection to MongoDB Atlas established successfully.');
  } catch (error) {
    console.warn('⚠️ MongoDB Atlas Connection Failure:', error.message);
    console.log('Backend will operate, but API operations will require MongoDB online.');
  }
};

export { connectDB };
export default mongoose;
