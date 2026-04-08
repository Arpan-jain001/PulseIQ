import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

import adminAnalyticsRoutes from "./routes/admin.analytics.routes.js";
import adminNotificationRoutes from "./routes/admin.notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import adminWorkspaceRoutes from "./routes/admin.workspace.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import authRoutes from "./routes/auth.routes.js";
import eventRoutes from "./routes/event.routes.js";
import funnelRoutes from "./routes/funnel.routes.js";
import ingestRoutes from "./routes/ingest.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import projectRoutes from "./routes/project.routes.js";
import resendWebhookRoutes from "./routes/resendWebhook.routes.js";
import userRoutes from "./routes/user.routes.js";
import verificationRoutes from "./routes/verification.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import rateLimiter from "./middleware/rateLimit.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(morgan("combined"));
app.use(rateLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("PulseIQ API Running");
});

app.get("/health", (req, res) => {
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";
  const healthy = dbState === "connected";

  res.status(healthy ? 200 : 503).json({
    success: true,
    message: healthy ? "PulseIQ backend healthy" : "PulseIQ backend degraded",
    timestamp: new Date().toISOString(),
    database: dbState,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/funnel", funnelRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/webhook", resendWebhookRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/workspaces", adminWorkspaceRoutes);
app.use("/api/admin/notifications", adminNotificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;
