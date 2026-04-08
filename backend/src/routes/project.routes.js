import express from "express";
import Event from "../models/Event.js";
import Membership from "../models/Membership.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { allowRoles, protect, verifiedOnly } from "../middleware/auth.middleware.js";
import { writeAudit } from "../services/audit.service.js";
import { deleteProjectCascade, isDeleteConfirmationValid } from "../services/deletion.service.js";
import { seedProjectDemoData } from "../services/demoData.service.js";
import {
  notifyProjectCreated,
  notifyProjectDeleted,
} from "../services/projectLifecycle.service.js";
import { getAccessibleProject, getAccessibleWorkspace } from "../services/projectAccess.service.js";
import { inferProjectCategory } from "../services/projectCategory.service.js";
import { normalizeDomainList } from "../utils/domainPolicy.js";
import { generateApiKey } from "../utils/generateApiKey.js";

const router = express.Router();

router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, async (req, res) => {
  try {
    const { workspaceId, name, allowedDomains = [] } = req.body;
    const normalizedDomains = normalizeDomainList(allowedDomains);

    const workspace = await getAccessibleWorkspace({
      workspaceId,
      user: req.user,
      allowedMembershipRoles: ["OWNER", "ADMIN"],
    });

    const actor = await User.findById(req.user._id).select("name email");
    const { raw, hash } = generateApiKey();
    const category = inferProjectCategory({ project: { name, allowedDomains: normalizedDomains } });

    const project = await Project.create({
      workspaceId: workspace._id,
      name,
      apiKeyHash: hash,
      allowedDomains: normalizedDomains,
      categoryKey: category.key,
      categoryLabel: category.label,
      categoryConfidence: category.confidence,
    });

    await writeAudit({
      actorId: req.user._id,
      action: "PROJECT_CREATE",
      targetType: "PROJECT",
      targetId: project._id,
      meta: { workspaceId: workspace._id, allowedDomains: normalizedDomains },
    });

    await notifyProjectCreated({
      workspaceId: workspace._id,
      project,
      actor,
    });

    res.status(201).json({ success: true, data: { project, apiKey: raw } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    let list;

    if (req.user.role === "SUPER_ADMIN") {
      list = await Project.find().populate("workspaceId", "name ownerId status").sort({ createdAt: -1 });
    } else {
      const memberships = await Membership.find({ userId: req.user._id, status: "ACTIVE" });
      const workspaceIds = memberships.map((membership) => membership.workspaceId);
      list = await Project.find({ workspaceId: { $in: workspaceIds } })
        .populate("workspaceId", "name")
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/:id", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    await getAccessibleProject({
      projectId: req.params.id,
      user: req.user,
      allowedMembershipRoles: ["OWNER", "ADMIN"],
    });

    const { name, allowedDomains } = req.body;
    const update = {};

    if (name) update.name = name;
    if (allowedDomains !== undefined) {
      update.allowedDomains = normalizeDomainList(allowedDomains);
    }

    if (name || allowedDomains !== undefined) {
      const existing = await Project.findById(req.params.id).lean();
      const category = inferProjectCategory({
        project: {
          name: name || existing?.name,
          allowedDomains:
            allowedDomains !== undefined ? update.allowedDomains : existing?.allowedDomains,
        },
      });
      update.categoryKey = category.key;
      update.categoryLabel = category.label;
      update.categoryConfidence = category.confidence;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    if (!isDeleteConfirmationValid(req.body?.confirmation)) {
      return res.status(400).json({
        success: false,
        message: 'Type "delete" to permanently delete this item.',
      });
    }

    const project = await getAccessibleProject({
      projectId: req.params.id,
      user: req.user,
      allowedMembershipRoles: ["OWNER", "ADMIN"],
    });

    const [actor, lastEvent, totalEvents] = await Promise.all([
      User.findById(req.user._id).select("name email"),
      Event.findOne({ projectId: project._id }).sort({ ts: -1 }).select("ts"),
      Event.countDocuments({ projectId: project._id }),
    ]);

    await deleteProjectCascade(project._id);

    await writeAudit({
      actorId: req.user._id,
      action: "PROJECT_DELETE",
      targetType: "PROJECT",
      targetId: project._id,
      meta: { workspaceId: project.workspaceId, name: project.name, totalEvents },
    });

    await notifyProjectDeleted({
      workspaceId: project.workspaceId,
      projectName: project.name,
      actor,
      deletedStats: {
        totalEvents,
        lastEventAt: lastEvent?.ts || null,
        deletedAt: new Date(),
      },
    });

    res.json({ success: true, message: "Project deleted." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get("/:id/verify-sdk", protect, async (req, res) => {
  try {
    const project = await getAccessibleProject({ projectId: req.params.id, user: req.user });
    const since = new Date(Date.now() - 10 * 60 * 1000);
    const recentEvent = await Event.findOne({ projectId: project._id, createdAt: { $gte: since } });

    if (recentEvent) {
      if (!project.sdkVerified) {
        await Project.findByIdAndUpdate(project._id, { sdkVerified: true, sdkVerifiedAt: new Date() });
      }

      return res.json({
        success: true,
        verified: true,
        sdkVerified: true,
        message: "SDK is working! Events are being received.",
        event: { name: recentEvent.eventName, time: recentEvent.createdAt },
      });
    }

    if (project.sdkVerified) {
      return res.json({
        success: true,
        verified: true,
        sdkVerified: true,
        message: "SDK was previously verified.",
        verifiedAt: project.sdkVerifiedAt,
      });
    }

    const graceCutoff = new Date(project.createdAt);
    graceCutoff.setDate(graceCutoff.getDate() + 7);
    const inGrace = new Date() < graceCutoff;
    const msLeft = graceCutoff - new Date();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      verified: false,
      sdkVerified: false,
      skippedVerification: project.skippedVerification,
      inGracePeriod: inGrace,
      graceDaysLeft: daysLeft,
      message: inGrace
        ? `SDK not verified yet. ${daysLeft} day(s) left in grace period.`
        : "Grace period expired. Please verify your SDK.",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.get("/:id/status", protect, async (req, res) => {
  try {
    const project = await getAccessibleProject({ projectId: req.params.id, user: req.user });

    const [eventCount, lastEvent] = await Promise.all([
      Event.countDocuments({ projectId: project._id }),
      Event.findOne({ projectId: project._id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        _id: project._id,
        name: project.name,
        sdkVerified: project.sdkVerified,
        sdkVerifiedAt: project.sdkVerifiedAt,
        eventCount,
        lastEventAt: lastEvent?.createdAt || null,
        status: project.status,
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post("/:id/skip-verification", protect, async (req, res) => {
  try {
    const project = await getAccessibleProject({ projectId: req.params.id, user: req.user });
    if (project.sdkVerified) {
      return res.json({ success: true, message: "Already verified." });
    }

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
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

router.post("/:id/generate-demo-data", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    await getAccessibleProject({
      projectId: req.params.id,
      user: req.user,
      allowedMembershipRoles: ["OWNER", "ADMIN"],
    });

    const data = await seedProjectDemoData({
      projectId: req.params.id,
      days: Number(req.body?.days) > 0 ? Math.min(Number(req.body.days), 60) : 21,
    });

    res.json({
      success: true,
      message: "Live analytics dataset generated successfully.",
      data,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
});

export default router;
