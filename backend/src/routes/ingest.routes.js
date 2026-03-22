import express from "express";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import { hashApiKey } from "../utils/generateApiKey.js";
import { createSession } from "../services/session.service.js";

const router = express.Router();

router.post("/event", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ success: false, message: "Missing API key" });
    }

    const apiKeyHash = hashApiKey(apiKey);

    const project = await Project.findOne({
      apiKeyHash,
      status: "ACTIVE",
    });

    if (!project) {
      return res.status(401).json({ success: false, message: "Invalid API key" });
    }

    /* ===== DOMAIN CHECK ===== */

    const origin = req.headers.origin || "";

    if (project.allowedDomains?.length) {
      const ok = project.allowedDomains.some((d) => origin.includes(d));

      if (!ok) {
        return res.status(403).json({
          success: false,
          message: "Domain not allowed",
        });
      }
    }

    const { eventName, anonymousId, userId, properties, ts } = req.body;

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: "eventName required",
      });
    }

    /* ===== CREATE EVENT ===== */

    const event = await Event.create({
      projectId: project._id,
      eventName,
      anonymousId: anonymousId || "",
      userId: userId || "",
      properties: properties || {},
      ts: ts ? new Date(ts) : new Date(),
      ip: req.ip || "",
      ua: req.headers["user-agent"] || "",
    });

    /* ===== SESSION TRACKING (NEW) ===== */

    if (!req.body.sessionId) {
      await createSession({
        userId: userId || anonymousId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    /* ===== AUTO VERIFY SDK ON FIRST EVENT ===== */
    // Jaise hi pehla event aata hai, project sdkVerified ho jaata hai
    // Analytics tab tab khulega

    if (!project.sdkVerified) {
      await Project.findByIdAndUpdate(project._id, {
        sdkVerified:   true,
        sdkVerifiedAt: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      data: { id: event._id },
    });
  } catch (error) {
    console.error("❌ Ingest error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;