// backend/src/routes/workspace.routes.js — REPLACE existing file
import express from "express";
import { protect, allowRoles, verifiedOnly } from "../middleware/auth.middleware.js";
import { create, mine, members } from "../controllers/workspace.controller.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getWorkspaceInviteTemplate } from "../utils/emailTemplate.js";

const router = express.Router();

// ── Keep existing ─────────────────────────────────────
router.get("/mine", protect, mine);
router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, create);
router.get("/:id/members", protect, members);

// ── UPDATED: Add member by EMAIL + send invite email ──
router.post("/:id/members", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    const { email, role = "MEMBER" } = req.body;
    const workspaceId = req.params.id;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ success: false, message: "No PulseIQ account found with this email. Ask them to register first." });

    const existing = await Membership.findOne({ workspaceId, userId: user._id, status: "ACTIVE" });
    if (existing) return res.status(409).json({ success: false, message: "This user is already a member." });

    await Membership.findOneAndUpdate(
      { workspaceId, userId: user._id },
      { role, status: "ACTIVE" },
      { upsert: true, new: true }
    );

    const inviter = await User.findById(req.user._id).select("name email");
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";

    // ✅ Upgraded email template
    await sendEmail({
      to:      user.email,
      subject: `${inviter.name} invited you to "${workspace.name}" on PulseIQ`,
      html:    getWorkspaceInviteTemplate({
        userName:      user.name,
        userEmail:     user.email,
        inviterName:   inviter.name,
        workspaceName: workspace.name,
        role,
        frontendUrl,
      }),
    });

    res.status(201).json({ success: true, message: `Invitation sent to ${user.email} and they've been added.` });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Remove member ─────────────────────────────────────
router.delete("/:id/members/:userId", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    await Membership.findOneAndUpdate(
      { workspaceId: req.params.id, userId: req.params.userId },
      { status: "REMOVED" }
    );
    res.json({ success: true, message: "Member removed." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Delete workspace ──────────────────────────────────
router.delete("/:id", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) return res.status(404).json({ success: false, message: "Workspace not found." });

    if (ws.ownerId.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Only the owner can delete this workspace." });
    }

    await Workspace.findByIdAndDelete(req.params.id);
    await Membership.deleteMany({ workspaceId: req.params.id });
    res.json({ success: true, message: "Workspace deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;