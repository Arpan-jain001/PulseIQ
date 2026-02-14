import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * GET /api/notifications?workspaceId=optional&limit=50
 * - Shows GLOBAL notifications
 * - Shows USER targeted notifications
 * - Shows WORKSPACE targeted notifications (if workspaceId passed)
 */
router.get("/", protect, async (req, res, next) => {
  try {
    const uid = req.user._id;
    const { workspaceId } = req.query;

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    const orConditions = [
      { type: "GLOBAL" },
      { type: "USER", targetUser: uid },
    ];

    if (workspaceId) {
      orConditions.push({ type: "WORKSPACE", targetWorkspace: workspaceId });
    }

    const list = await Notification.find({ $or: orConditions })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Marks notification as read for current user
 */
router.patch("/:id/read", protect, async (req, res, next) => {
  try {
    const uid = req.user._id;

    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: uid } }, // ✅ prevents duplicates
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, message: "Marked read", data: updated });
  } catch (e) {
    next(e);
  }
});

export default router;
