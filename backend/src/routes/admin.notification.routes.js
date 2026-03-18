import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", protect, superAdminOnly, async (req, res) => {
  const list = await Notification.find();
  res.json({ success: true, data: list });
});

export default router;