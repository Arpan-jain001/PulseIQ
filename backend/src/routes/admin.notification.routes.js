import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protect, superAdminOnly, async (req, res) => {
  const list = await Notification.find()
    .populate("targetUser", "name email role")
    .populate("targetWorkspace", "name");
  res.json({ success: true, data: list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

router.post("/", protect, superAdminOnly, async (req, res) => {
  try {
    const { title, message, target = "ALL", targetUser, targetWorkspace } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    let type = "GLOBAL";
    const payload = {
      title: title.trim(),
      message: message.trim(),
    };

    if (target === "USER") {
      if (!targetUser) {
        return res.status(400).json({ success: false, message: "Choose a user to send this notification." });
      }
      type = "USER";
      payload.targetUser = targetUser;
    } else if (target === "WORKSPACE") {
      if (!targetWorkspace) {
        return res.status(400).json({ success: false, message: "Choose a workspace to send this notification." });
      }
      type = "WORKSPACE";
      payload.targetWorkspace = targetWorkspace;
    }

    payload.type = type;

    const notif = await Notification.create(payload);
    const populated = await Notification.findById(notif._id)
      .populate("targetUser", "name email role")
      .populate("targetWorkspace", "name");

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  const deleted = await Notification.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Notification not found." });
  }
  return res.json({ success: true, message: "Notification deleted." });
});

export default router;
