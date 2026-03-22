// backend/src/routes/admin.workspace.routes.js — REPLACE existing file
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";
import Project from "../models/Project.js";

const router = express.Router();

// ── GET all workspaces with full details ──────────────
router.get("/", protect, superAdminOnly, async (req, res) => {
  try {
    const workspaces = await Workspace.find()
      .populate("ownerId", "name email role companyName verificationStatus status createdAt")
      .sort({ createdAt: -1 });

    // For each workspace, get member count + project count
    const enriched = await Promise.all(
      workspaces.map(async (ws) => {
        const [memberCount, projectCount] = await Promise.all([
          Membership.countDocuments({ workspaceId: ws._id, status: "ACTIVE" }),
          Project.countDocuments({ workspaceId: ws._id }),
        ]);
        return { ...ws.toObject(), memberCount, projectCount };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── GET single workspace full details ─────────────────
router.get("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("ownerId", "name email role companyName verificationStatus status createdAt");

    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found." });

    const [members, projects] = await Promise.all([
      Membership.find({ workspaceId: req.params.id, status: "ACTIVE" })
        .populate("userId", "name email role status createdAt"),
      Project.find({ workspaceId: req.params.id }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        workspace: workspace.toObject(),
        members,
        projects,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── DELETE workspace + all its data ──────────────────
router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    await Workspace.findByIdAndDelete(req.params.id);
    await Membership.deleteMany({ workspaceId: req.params.id });
    await Project.deleteMany({ workspaceId: req.params.id });
    res.json({ success: true, message: "Workspace and all related data deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;