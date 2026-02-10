import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("\n===============================");
      console.log("🚀 PulseIQ Backend Started ✅");
      console.log(`🌐 Server Running: http://localhost:${PORT}`);
      console.log("===============================\n");
    });
  } catch (error) {
    console.log("❌ Server Failed to Start:", error.message);
    process.exit(1);
  }
};

startServer();
