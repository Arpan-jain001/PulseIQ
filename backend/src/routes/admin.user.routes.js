// backend/src/routes/admin.user.routes.js — REPLACE existing file
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getNewAdminTemplate,
  getAdminRemovedTemplate,
} from "../utils/emailTemplate.js";

const router = express.Router();

// ── Get all users ─────────────────────────────────────
router.get("/", protect, superAdminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken");
    res.json({ success: true, data: users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Create new admin ──────────────────────────────────
router.post("/create-admin", protect, superAdminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required." });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "User with this email already exists." });
    }

    // ✅ DO NOT hash manually — User model pre("save") hook handles hashing
    const newAdmin = await User.create({
      name,
      email:          email.toLowerCase().trim(),
      password,       // raw password — pre-save hook will hash it
      role:           "SUPER_ADMIN",
      emailVerified:  true,
      status:         "ACTIVE",
    });

    // Get creator info
    const creator = await User.findById(req.user._id).select("name email");

    // ✅ Send credentials email to new admin
    await sendEmail({
      to:      newAdmin.email,
      subject: "You've been added as an Admin on PulseIQ",
      html:    getNewAdminTemplate({
        name:      newAdmin.name,
        email:     newAdmin.email,
        password,                          // raw password — shown once
        createdBy: creator?.name || "Super Admin",
      }),
    });

    res.status(201).json({
      success: true,
      message: `Admin created and credentials sent to ${newAdmin.email}`,
      data:    { _id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Remove admin (downgrade to USER) ─────────────────
// Body: { reason?: string }
router.patch("/:id/remove-admin", protect, superAdminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const target = await User.findById(req.params.id);

    if (!target) return res.status(404).json({ success: false, message: "User not found." });
    if (target.role !== "SUPER_ADMIN") {
      return res.status(400).json({ success: false, message: "User is not an admin." });
    }
    // Prevent self-demotion
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot remove your own admin privileges." });
    }

    await User.findByIdAndUpdate(req.params.id, { role: "USER" });

    const remover = await User.findById(req.user._id).select("name");

    // ✅ Send removal email with reason
    await sendEmail({
      to:      target.email,
      subject: "Your Admin Access on PulseIQ Has Been Revoked",
      html:    getAdminRemovedTemplate({
        name:      target.name,
        email:     target.email,
        removedBy: remover?.name || "Super Admin",
        reason:    reason || null,
      }),
    });

    res.json({
      success: true,
      message: `Admin privileges removed from ${target.name}. Notification sent.`,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Hard delete user ──────────────────────────────────
router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found." });
    if (target._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted." });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;