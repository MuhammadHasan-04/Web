import mongoose from "mongoose";

const url = process.env.MONGO_URI || process.env.MONGODB_URI;

const DB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (!url) {
    console.error("❌ ERROR: MONGODB_URI is not defined in .env.local");
    return;
  }

  try {
    await mongoose.connect(url);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB Connection error:", error);
  }
};

export default DB;
