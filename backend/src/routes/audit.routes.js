import express from "express";
import { protect, allowRoles } from "../middleware/auth.middleware.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

router.get("/", protect, allowRoles("SUPER_ADMIN"), async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: logs });
});

export default router;