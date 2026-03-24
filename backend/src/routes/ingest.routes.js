import express from "express";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import { hashApiKey } from "../utils/generateApiKey.js";
import { createSession } from "../services/session.service.js";

const router = express.Router();

/* ===== 🔐 RATE LIMIT (per API key) ===== */
const rateMap = new Map();

function checkRateLimit(apiKey) {
  const now = Date.now();
  const windowTime = 60 * 1000; // 1 min
  const limit = 100; // max 100 req/min

  if (!rateMap.has(apiKey)) {
    rateMap.set(apiKey, []);
  }

  const timestamps = rateMap.get(apiKey).filter(t => now - t < windowTime);

  if (timestamps.length >= limit) return false;

  timestamps.push(now);
  rateMap.set(apiKey, timestamps);
  return true;
}

/* ===== 🚀 INGEST EVENT ===== */
router.post("/event", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    /* ===== 🔐 API KEY CHECK ===== */
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Missing API key",
      });
    }

    /* ===== 🚫 RATE LIMIT CHECK ===== */
    if (!checkRateLimit(apiKey)) {
      return res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    }

    const apiKeyHash = hashApiKey(apiKey);

    const project = await Project.findOne({
      apiKeyHash,
      status: "ACTIVE",
    });

    if (!project) {
      return res.status(401).json({
        success: false,
        message: "Invalid API key",
      });
    }

    /* ===== 📦 BODY DATA ===== */
    const { eventName, anonymousId, userId, properties, ts } = req.body;

    /* ===== 🧠 VALIDATION ===== */
    if (!eventName || typeof eventName !== "string" || eventName.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid eventName",
      });
    }

    if (!anonymousId && !userId) {
      return res.status(400).json({
        success: false,
        message: "User पहचान missing",
      });
    }

    if (properties && typeof properties !== "object") {
      return res.status(400).json({
        success: false,
        message: "Invalid properties",
      });
    }

    /* ===== ⚠️ SUSPICIOUS PAYLOAD LOG ===== */
    if (properties && Object.keys(properties).length > 20) {
      console.warn("⚠️ Suspicious payload:", properties);
    }

    /* ===== 🌐 CAPTURE ORIGIN (for analytics, NOT blocking) ===== */
    const origin = req.headers.origin || "";

    /* ===== 📝 CREATE EVENT ===== */
    const event = await Event.create({
      projectId: project._id,
      eventName,
      anonymousId: anonymousId || "",
      userId: userId || "",
      properties: {
        ...properties,
        origin, // store for analytics
      },
      ts: ts ? new Date(ts) : new Date(),
      ip: req.ip || "",
      ua: req.headers["user-agent"] || "",
    });

    /* ===== 📊 SESSION TRACKING ===== */
    if (!req.body.sessionId) {
      await createSession({
        userId: userId || anonymousId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    /* ===== ✅ AUTO SDK VERIFY ===== */
    if (!project.sdkVerified) {
      await Project.findByIdAndUpdate(project._id, {
        sdkVerified: true,
        sdkVerifiedAt: new Date(),
      });
    }

    /* ===== 🎯 SUCCESS ===== */
    res.status(201).json({
      success: true,
      data: { id: event._id },
    });

  } catch (error) {
    console.error("❌ Ingest error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;