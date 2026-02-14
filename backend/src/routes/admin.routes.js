import express from "express";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Notification from "../models/Notification.js";
import { protect, allowRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Super Admin overview
router.get("/overview", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const users = await User.countDocuments();
  const workspaces = await Workspace.countDocuments();
  const notifications = await Notification.countDocuments();
  res.json({ success: true, data: { users, workspaces, notifications } });
});

// List users (CRUD read)
router.get("/users", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const list = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });
  res.json({ success: true, data: list });
});

// Update user status
router.patch("/users/:id/status", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select("-password -refreshToken");
  res.json({ success: true, data: user });
});

// Verify organizer
router.patch("/users/:id/verify", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const { verificationStatus } = req.body; // VERIFIED/REJECTED
  const user = await User.findByIdAndUpdate(req.params.id, { verificationStatus }, { new: true }).select("-password -refreshToken");
  res.json({ success: true, data: user });
});

// Send notification (global/user/workspace)
router.post("/notifications", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const { title, message, type, targetUser, targetWorkspace } = req.body;
  const notif = await Notification.create({ title, message, type, targetUser, targetWorkspace });
  res.status(201).json({ success: true, data: notif });
});

export default router;
