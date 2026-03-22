// backend/src/routes/project.routes.js — REPLACE existing file
import express from "express";
import Project from "../models/Project.js";
import Event from "../models/Event.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";
import { protect, allowRoles, verifiedOnly } from "../middleware/auth.middleware.js";
import { generateApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

// ── Create project (keep exactly as original + try/catch) ──
router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, async (req, res) => {
  try {
    const { workspaceId, name, allowedDomains = [] } = req.body;
    const ws = await Workspace.findById(workspaceId);
    if (!ws) return res.status(404).json({ success: false, message: "Workspace not found" });

    const { raw, hash } = generateApiKey();
    const project = await Project.create({ workspaceId, name, apiKeyHash: hash, allowedDomains });

    res.status(201).json({ success: true, data: { project, apiKey: raw } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Get projects (organizer sees only their workspace projects) ──
router.get("/", protect, async (req, res) => {
  try {
    let list;
    if (req.user.role === "SUPER_ADMIN") {
      // Admin sees ALL with workspace info
      list = await Project.find().populate("workspaceId", "name ownerId status").sort({ createdAt: -1 });
    } else {
      // Organizer sees only their workspaces' projects
      const memberships = await Membership.find({ userId: req.user._id, status: "ACTIVE" });
      const wsIds = memberships.map(m => m.workspaceId);
      list = await Project.find({ workspaceId: { $in: wsIds } })
        .populate("workspaceId", "name")
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, data: list });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


// ── NEW: Update project (name, allowedDomains) ───────
router.patch("/:id", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    const { name, allowedDomains } = req.body;
    const update = {};
    if (name) update.name = name;
    if (allowedDomains !== undefined) update.allowedDomains = allowedDomains;
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    res.json({ success: true, data: project });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── NEW: Delete project ───────────────────────────────
router.delete("/:id", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


// ── Verify SDK — check sdkVerified flag + recent events ──
router.get("/:id/verify-sdk", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    // Check for event in last 10 minutes (for live polling)
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recentEvent = await Event.findOne({ projectId: project._id, createdAt: { $gte: since } });

    if (recentEvent) {
      // Auto-update sdkVerified if not already
      if (!project.sdkVerified) {
        await Project.findByIdAndUpdate(project._id, { sdkVerified: true, sdkVerifiedAt: new Date() });
      }
      return res.json({
        success: true, verified: true,
        sdkVerified: true,
        message: "SDK is working! Events are being received.",
        event: { name: recentEvent.eventName, time: recentEvent.createdAt },
      });
    }

    // Already verified before
    if (project.sdkVerified) {
      return res.json({
        success: true, verified: true,
        sdkVerified: true,
        message: "SDK was previously verified.",
        verifiedAt: project.sdkVerifiedAt,
      });
    }

    // Calculate grace period
    const graceCutoff = new Date(project.createdAt);
    graceCutoff.setDate(graceCutoff.getDate() + 7);
    const inGrace    = new Date() < graceCutoff;
    const msLeft     = graceCutoff - new Date();
    const daysLeft   = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    res.json({
      success: true, verified: false,
      sdkVerified:         false,
      skippedVerification: project.skippedVerification,
      inGracePeriod:       inGrace,
      graceDaysLeft:       daysLeft,
      message: inGrace
        ? `SDK not verified yet. ${daysLeft} day(s) left in grace period.`
        : "Grace period expired. Please verify your SDK.",
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Get project status (sdkVerified + details) ─────────
router.get("/:id/status", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    const eventCount = await Event.countDocuments({ projectId: project._id });
    const lastEvent  = await Event.findOne({ projectId: project._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        _id:           project._id,
        name:          project.name,
        sdkVerified:   project.sdkVerified,
        sdkVerifiedAt: project.sdkVerifiedAt,
        eventCount,
        lastEventAt:   lastEvent?.createdAt || null,
        status:        project.status,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


// ── Skip verification (grace period) ──────────────────
router.post("/:id/skip-verification", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (project.sdkVerified) return res.json({ success: true, message: "Already verified." });

    // Check grace period (7 days from creation)
    const graceCutoff = new Date(project.createdAt);
    graceCutoff.setDate(graceCutoff.getDate() + 7);
    const inGrace = new Date() < graceCutoff;

    if (!inGrace) {
      return res.status(400).json({
        success: false,
        message: "Grace period expired. Please verify your SDK to access analytics.",
      });
    }

    await Project.findByIdAndUpdate(project._id, {
      skippedVerification: true,
      skippedAt: new Date(),
    });

    res.json({ success: true, message: "Skipped. Analytics accessible during grace period." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;