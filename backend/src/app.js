import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import rateLimiter from "./middleware/rateLimit.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

/* ================= ROUTES ================= */

import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";

import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import userRoutes from "./routes/user.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminWorkspaceRoutes from "./routes/admin.workspace.routes.js";
import adminNotificationRoutes from "./routes/admin.notification.routes.js";
import eventRoutes from "./routes/event.routes.js";
/* =========================================== */

const app = express();

/* ================= SECURITY ================= */

app.use(helmet());
app.use(morgan("combined"));
app.use(rateLimiter);

/* ================= BODY PARSER ================= */

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================= CORS ================= */

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

/* ================= HEALTH CHECK ================= */

// Root (browser friendly)
app.get("/", (req, res) => {
  res.send("🚀 PulseIQ API Running");
});

// Health check (production)
app.get("/health", (req, res) => {
  res.json({ success: true, message: "PulseIQ backend healthy 🚀" });
});

/* ================= API ROUTES ================= */

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ingest", ingestRoutes);

app.use("/api/workspaces", workspaceRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
/* ===== ADMIN ROUTES ===== */

app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/workspaces", adminWorkspaceRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);

/* ================= 404 ================= */

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

/* ================= ERROR HANDLER ================= */

app.use(errorHandler);

export default app;
