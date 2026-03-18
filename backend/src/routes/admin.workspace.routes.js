import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { superAdminOnly } from "../middleware/superAdmin.middleware.js";
import Workspace from "../models/Workspace.js";

const router = express.Router();

router.get("/", protect, superAdminOnly, async (req, res) => {
  const list = await Workspace.find();
  res.json({ success: true, data: list });
});

router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  await Workspace.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Workspace deleted" });
});

export default router;