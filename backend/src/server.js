import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { startJobs } from "./jobs/index.js"; // 🔥 add this

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const start = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log("=================================");
      console.log("🚀 PulseIQ Backend Started");
      console.log(`🌐 http://localhost:${PORT}`);
      console.log("ENV:", process.env.NODE_ENV);
      console.log("=================================");
    });

    /* ===== START CRON JOBS ===== */
    startJobs();

  } catch (error) {
    console.error("❌ Server start error:", error.message);
    process.exit(1);
  }
};

start();