import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 8000,
    });

    console.log("✅ MongoDB Connected");
    console.log(`📌 Host: ${conn.connection.host}`);
    console.log(`📂 DB: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
