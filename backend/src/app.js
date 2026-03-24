import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

/* ================= MIDDLEWARE ================= */

import rateLimiter from "./middleware/rateLimit.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

/* ================= ROUTES ================= */

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";

import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import userRoutes from "./routes/user.routes.js";
import eventRoutes from "./routes/event.routes.js";

/* ===== ADMIN ROUTES ===== */

import adminRoutes from "./routes/admin.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminWorkspaceRoutes from "./routes/admin.workspace.routes.js";
import adminNotificationRoutes from "./routes/admin.notification.routes.js";

/* =========================================== */

const app = express();

/* ================= 🔥 TRUST PROXY (RENDER FIX) ================= */
app.set("trust proxy", 1);

/* ================= SECURITY ================= */

// Helmet → secure headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Logger
app.use(morgan("combined"));

/* ================= RATE LIMIT ================= */

app.use(rateLimiter);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= CORS (PRODUCTION READY) ================= */

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
  })
);

/* ================= HEALTH CHECK ================= */

// Root
app.get("/", (req, res) => {
  res.send("🚀 PulseIQ API Running");
});

// Health
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PulseIQ backend healthy 🚀",
    timestamp: new Date().toISOString(),
  });
});

/* ================= API ROUTES ================= */

// 🔐 AUTH
app.use("/api/auth", authRoutes);

// 📊 CORE
app.use("/api/projects", projectRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// 🏢 WORKSPACE
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/verification", verificationRoutes);

// 🔔 NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);

// 👤 USERS
app.use("/api/users", userRoutes);

// 📅 EVENTS
app.use("/api/events", eventRoutes);

/* ===== ADMIN ROUTES ===== */

app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/workspaces", adminWorkspaceRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export default app;