import express from "express";
import Event from "../models/Event.js";
import Project from "../models/Project.js";
import { inferProjectCategory } from "../services/projectCategory.service.js";
import { createSession } from "../services/session.service.js";
import { extractRequestHosts, isAllowedHost } from "../utils/domainPolicy.js";
import { hashApiKey } from "../utils/generateApiKey.js";

const router = express.Router();
const rateMap = new Map();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = Number(process.env.INGEST_RATE_LIMIT_PER_MINUTE || 100);

function checkRateLimit(apiKey) {
  const now = Date.now();
  const staleBefore = now - RATE_WINDOW_MS * 2;

  for (const [key, times] of rateMap.entries()) {
    const fresh = times.filter((time) => time >= staleBefore);
    if (fresh.length) rateMap.set(key, fresh);
    else rateMap.delete(key);
  }

  if (!rateMap.has(apiKey)) {
    rateMap.set(apiKey, []);
  }

  const timestamps = rateMap.get(apiKey).filter((time) => now - time < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT) return false;

  timestamps.push(now);
  rateMap.set(apiKey, timestamps);
  return true;
}

router.post("/event", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ success: false, message: "Missing API key" });
    }

    if (!checkRateLimit(apiKey)) {
      return res.status(429).json({ success: false, message: "Too many requests" });
    }

    const apiKeyHash = hashApiKey(apiKey);
    const project = await Project.findOne({ apiKeyHash, status: "ACTIVE" });

    if (!project) {
      return res.status(401).json({ success: false, message: "Invalid API key" });
    }

    const { eventName, anonymousId, userId, properties, ts, sessionId } = req.body;

    if (!eventName || typeof eventName !== "string" || eventName.length > 50) {
      return res.status(400).json({ success: false, message: "Invalid eventName" });
    }

    if (!anonymousId && !userId) {
      return res.status(400).json({
        success: false,
        message: "anonymousId or userId is required",
      });
    }

    if (properties && typeof properties !== "object") {
      return res.status(400).json({ success: false, message: "Invalid properties" });
    }

    const requestHosts = extractRequestHosts(req, properties || {});
    const isBrowserRequest = Boolean(req.headers.origin || req.headers.referer);

    if (
      isBrowserRequest &&
      Array.isArray(project.allowedDomains) &&
      project.allowedDomains.length > 0 &&
      !isAllowedHost(requestHosts, project.allowedDomains)
    ) {
      return res.status(403).json({
        success: false,
        message: "Origin domain is not allowed for this project",
      });
    }

    if (properties && Object.keys(properties).length > 20) {
      console.warn("Suspicious ingest payload:", properties);
    }

    const origin = req.headers.origin || "";

    const event = await Event.create({
      projectId: project._id,
      eventName,
      sessionId: sessionId || "",
      anonymousId: anonymousId || "",
      userId: userId || "",
      properties: {
        ...properties,
        origin,
      },
      ts: ts ? new Date(ts) : new Date(),
      ip: req.ip || "",
      ua: req.headers["user-agent"] || "",
    });

    if (!req.body.sessionId) {
      await createSession({
        userId: userId || anonymousId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    const category = inferProjectCategory({
      project,
      events: [{ eventName, properties: event.properties }],
    });

    const projectUpdates = {
      categoryKey: category.key,
      categoryLabel: category.label,
      categoryConfidence: Math.max(project.categoryConfidence || 0, category.confidence || 0),
    };

    if (!project.sdkVerified) {
      projectUpdates.sdkVerified = true;
      projectUpdates.sdkVerifiedAt = new Date();
    }

    await Project.findByIdAndUpdate(project._id, projectUpdates);

    res.status(201).json({
      success: true,
      data: { id: event._id },
    });
  } catch (error) {
    console.error("Ingest error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
