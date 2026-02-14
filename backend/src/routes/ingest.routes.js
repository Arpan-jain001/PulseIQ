import express from "express";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import { hashApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

router.post("/event", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ success: false, message: "Missing API key" });

  const apiKeyHash = hashApiKey(apiKey);
  const project = await Project.findOne({ apiKeyHash, status: "ACTIVE" });

  if (!project) return res.status(401).json({ success: false, message: "Invalid API key" });

  const origin = req.headers.origin || "";
  if (project.allowedDomains?.length) {
    const ok = project.allowedDomains.some((d) => origin.includes(d));
    if (!ok) return res.status(403).json({ success: false, message: "Domain not allowed" });
  }

  const { eventName, anonymousId, userId, properties, ts } = req.body;

  if (!eventName) return res.status(400).json({ success: false, message: "eventName required" });

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

  res.status(201).json({ success: true, data: { id: event._id } });
});

export default router;
