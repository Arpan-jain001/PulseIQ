import crypto from "crypto";
import express from "express";
import { protect, allowRoles, verifiedOnly } from "../middleware/auth.middleware.js";
import { create, mine, members } from "../controllers/workspace.controller.js";
import Workspace from "../models/Workspace.js";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import { deleteWorkspaceCascade, isDeleteConfirmationValid } from "../services/deletion.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { getWorkspaceInviteTemplate } from "../utils/emailTemplate.js";
import { getFrontendUrl } from "../utils/frontendUrl.js";

const router = express.Router();

router.get("/mine", protect, mine);
router.post("/", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), verifiedOnly, create);
router.get("/:id/members", protect, members);

router.post("/:id/members", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    const { email, role = "MEMBER" } = req.body;
    const workspaceId = req.params.id;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No PulseIQ account exists for this email yet. Ask them to sign up first.",
      });
    }

    const existingActive = await Membership.findOne({ workspaceId, userId: user._id, status: "ACTIVE" });
    if (existingActive) {
      return res.status(409).json({ success: false, message: "This user is already an active member." });
    }

    const inviter = await User.findById(req.user._id).select("name email");
    const invitationToken = crypto.randomBytes(24).toString("hex");
    const frontendUrl = getFrontendUrl();
    const acceptUrl = `${frontendUrl}/login?invite=${invitationToken}`;
    const signupUrl = `${frontendUrl}/signup?invite=${invitationToken}`;

    await Membership.findOneAndUpdate(
      { workspaceId, userId: user._id },
      {
        role,
        status: "PENDING",
        invitedBy: inviter?._id || null,
        invitationToken,
        invitationSentAt: new Date(),
        acceptedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendEmail({
      to: user.email,
      subject: `${inviter?.name || "A teammate"} invited you to join "${workspace.name}" on PulseIQ`,
      html: getWorkspaceInviteTemplate({
        userName: user.name,
        inviterName: inviter?.name,
        workspaceName: workspace.name,
        role,
        acceptUrl,
        signupUrl,
      }),
    });

    return res.status(201).json({
      success: true,
      message: `Invitation sent to ${user.email}. The member will appear after accepting the invitation.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/invitations/accept", protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Invitation token is required." });
    }

    const membership = await Membership.findOne({
      invitationToken: token,
      userId: req.user._id,
      status: "PENDING",
    }).populate("workspaceId", "name");

    if (!membership) {
      return res.status(404).json({ success: false, message: "Invitation not found or already accepted." });
    }

    membership.status = "ACTIVE";
    membership.acceptedAt = new Date();
    membership.invitationToken = null;
    await membership.save();

    return res.json({
      success: true,
      message: `Invitation accepted. You now have access to ${membership.workspaceId?.name || "the workspace"}.`,
      data: membership,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id/members/:userId", protect, allowRoles("SUPER_ADMIN", "ORGANIZER"), async (req, res) => {
  try {
    if (!isDeleteConfirmationValid(req.body?.confirmation)) {
      return res.status(400).json({
        success: false,
        message: 'Type "delete" to permanently remove this member.',
      });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ success: false, message: "Workspace not found." });
    }

    const membership = await Membership.findOne({ workspaceId: req.params.id, userId: req.params.userId });
    if (!membership) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (membership.role === "OWNER") {
      return res.status(400).json({ success: false, message: "Workspace owner cannot be removed." });
    }

    await Membership.deleteOne({ _id: membership._id });
    return res.json({ success: true, message: "Member permanently removed." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ success: false, message: "Workspace not found." });

    if (workspace.ownerId.toString() !== req.user._id.toString() && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ success: false, message: "Only the owner can delete this workspace." });
    }

    await deleteWorkspaceCascade(req.params.id);
    return res.json({ success: true, message: "Workspace deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
